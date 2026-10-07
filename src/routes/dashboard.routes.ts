import type { UserRole } from "@/types/user.type";
import type { CurrentUser } from "@/types/user.type";

export function dashboardPathForRole(role: UserRole) {
  switch (role) {
    case "SUPER_ADMIN":
    case "ADMIN":
      return "/admin";
    case "LAWYER":
      return "/lawyer";
    case "CLIENT":
      return "/client";
  }
}

export function authenticatedPathForUser(user: CurrentUser) {
  if (user.needPasswordChange) {
    return "/forgot-password";
  }
  return dashboardPathForRole(user.role);
}
