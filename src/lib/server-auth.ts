import { prisma } from "./prisma";

export type UserRole = "USER" | "ADMIN";

export type ServerStoredUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
};

export async function getAllUsers() {
  return await prisma.user.findMany();
}

export async function findUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

export async function createUser(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}) {
  const exists = await findUserByEmail(input.email);

  if (exists) {
    return {
      success: false as const,
      message: "Bu e-posta ile kayıtlı bir kullanıcı zaten var.",
    };
  }

  const isAdmin = input.email.toLowerCase() === "admin@yildizstore.com";

  const newUser = await prisma.user.create({
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      passwordHash: input.password, // TODO: hash password
      role: isAdmin ? "ADMIN" : "USER",
    },
  });

  return {
    success: true as const,
    data: newUser,
  };
}

export async function validateUser(email: string, password: string) {
  const user = await prisma.user.findFirst({
    where: {
      email: email.toLowerCase(),
      passwordHash: password,
    },
  });

  if (!user) {
    return {
      success: false as const,
      message: "E-posta veya şifre hatalı.",
    };
  }

  return {
    success: true as const,
    data: user,
  };
}

export function toSafeUser(user: any) {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
  };
}