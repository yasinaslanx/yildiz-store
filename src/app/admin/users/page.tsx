"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: "USER" | "ADMIN" | "DEALER";
  permissions: string[];
  createdAt: string;
};

const PERMISSIONS = [
  { id: "ORDERS", label: "Siparişler" },
  { id: "PRODUCTS", label: "Ürünler" },
  { id: "USERS", label: "Kullanıcılar" },
  { id: "SUPPORT", label: "Destek" },
  { id: "MARKETING", label: "Pazarlama" },
  { id: "WAREHOUSE", label: "Depo" },
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      
      if (data.success) {
        setUsers(data.data);
      } else {
        toast.error(data.message || "Kullanıcılar getirilemedi");
      }
    } catch (error) {
      toast.error("Bir sunucu hatası oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!confirm(`Bu kullanıcının yetkisini ${newRole} olarak değiştirmek istediğinize emin misiniz?`)) {
      return;
    }

    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Yetki başarıyla güncellendi!");
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as User["role"] } : u));
      } else {
        toast.error(data.message || "Yetki güncellenemedi");
      }
    } catch (error) {
      toast.error("Sunucu hatası oluştu");
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePermissionToggle = async (userId: string, permissionId: string, currentPermissions: string[]) => {
    setUpdatingId(userId);
    try {
      const newPermissions = currentPermissions.includes(permissionId)
        ? currentPermissions.filter(p => p !== permissionId)
        : [...currentPermissions, permissionId];

      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: newPermissions })
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Özel izinler güncellendi!");
        setUsers(users.map(u => u.id === userId ? { ...u, permissions: newPermissions } : u));
      } else {
        toast.error(data.message || "İzin güncellenemedi");
      }
    } catch (error) {
      toast.error("Sunucu hatası oluştu");
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tighter text-stone-900">Kullanıcı Yönetimi</h1>
          <p className="text-sm font-bold text-stone-400 mt-2">Sistemdeki tüm kullanıcıları ve yetkilerini yönetin.</p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-stone-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-stone-50/50 border-b border-stone-100 text-stone-500 text-[10px] font-black uppercase tracking-widest">
                <th className="px-6 py-5">Kullanıcı</th>
                <th className="px-6 py-5">İletişim</th>
                <th className="px-6 py-5">Kayıt Tarihi</th>
                <th className="px-6 py-5">Yetki (Rol)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-stone-400">
                    <div className="flex justify-center items-center gap-3">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-stone-200 border-t-black" />
                      Yükleniyor...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center font-bold text-stone-400">
                    Hiç kullanıcı bulunamadı.
                  </td>
                </tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="group hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-stone-600 font-black">
                          {user.firstName[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-stone-400 mt-0.5">ID: {user.id.slice(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-stone-900">{user.email}</p>
                      {user.phone && <p className="text-xs text-stone-400 mt-0.5">{user.phone}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-medium text-stone-500">{formatDate(user.createdAt)}</p>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col gap-3">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={updatingId === user.id}
                          className={`text-xs font-bold px-4 py-2.5 rounded-xl outline-none cursor-pointer border-2 transition-all appearance-none ${
                            user.role === "ADMIN" 
                              ? "bg-black text-white border-black" 
                              : user.role === "DEALER"
                                ? "bg-blue-50 text-blue-700 border-blue-100 hover:border-blue-300"
                                : "bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300"
                          }`}
                        >
                          <option value="USER" className="bg-white text-black">USER (Standart)</option>
                          <option value="DEALER" className="bg-white text-black">DEALER (Bayi)</option>
                          <option value="ADMIN" className="bg-white text-black">ADMIN (Yönetici)</option>
                        </select>

                        {user.role === "ADMIN" && (
                          <div className="mt-2 p-4 bg-stone-50 border border-stone-100 rounded-xl">
                            <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-3">Özel Yetkiler</p>
                            <div className="flex flex-col gap-2">
                              {PERMISSIONS.map(perm => {
                                const hasPerm = user.permissions?.includes(perm.id);
                                return (
                                  <label key={perm.id} className="flex items-center gap-2 cursor-pointer group">
                                    <input 
                                      type="checkbox" 
                                      checked={hasPerm || false}
                                      disabled={updatingId === user.id}
                                      onChange={() => handlePermissionToggle(user.id, perm.id, user.permissions || [])}
                                      className="w-4 h-4 rounded border-stone-300 text-black focus:ring-black cursor-pointer"
                                    />
                                    <span className={`text-xs font-bold transition-colors ${hasPerm ? "text-stone-900" : "text-stone-500 group-hover:text-stone-700"}`}>
                                      {perm.label}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
