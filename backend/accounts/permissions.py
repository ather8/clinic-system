from rest_framework import permissions

STAFF_ROLES = {'admin', 'doctor', 'nurse', 'receptionist'}


class IsStaff(permissions.BasePermission):
    """Allows access only to staff roles (not patients)."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in STAFF_ROLES
        )


class IsAdmin(permissions.BasePermission):
    """Allows access only to admin role."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role == 'admin'
        )