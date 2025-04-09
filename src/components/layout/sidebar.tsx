
import { SidebarProvider, SidebarContent, Sidebar as SidebarComponent, SidebarTrigger, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { BarChart3, ClipboardList, Home, LogOut, Package2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const sidebarItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/"
  },
  {
    title: "Product Management",
    icon: ClipboardList,
    href: "/products"
  },
  {
    title: "Stock Overview",
    icon: Package2,
    href: "/stock"
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/analytics"
  }
];

// Helper function to get role display name
const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case 'manager':
      return 'Manager';
    case 'staff':
      return 'Staff';
    case 'cashier':
      return 'Cashier';
    default:
      return 'User';
  }
};

export function SidebarNav() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <SidebarComponent>
      <div className="flex h-16 items-center px-4 border-b">
        <h1 className="text-xl font-bold text-supermart-500">SuperMart</h1>
      </div>

      {user && (
        <div className="px-4 py-3 border-b">
          <p className="text-base font-semibold">Welcome, {user.username}</p>
          <p className="text-xs text-gray-500">{getRoleDisplayName(user.role)}</p>
        </div>
      )}

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <Link to={item.href} className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto pb-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={handleLogout} className="flex items-center gap-3 w-full">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </SidebarComponent>
  );
}

export function AppLayout() {
  const { user } = useAuth();
  
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <SidebarNav />
        <div className="flex flex-1 flex-col">
          <header className="h-16 flex items-center gap-4 border-b bg-white px-6">
            <SidebarTrigger />
            <h1 className="font-semibold">Stock Management System</h1>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
