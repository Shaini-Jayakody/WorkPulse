const ROLES = {
  TEAM_MEMBER: 'team_member',
  MANAGER: 'manager',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 4,
  [ROLES.ADMIN]: 3,
  [ROLES.MANAGER]: 2,
  [ROLES.TEAM_MEMBER]: 1
};

const APPROVAL_STATUS = {
  PENDING_MANAGER: 'pending_manager_approval',
  PENDING_ADMIN: 'pending_admin_approval',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  DEACTIVATED: 'deactivated'
};

const PERMISSIONS = {
  [ROLES.ADMIN]: ['*'],
  [ROLES.SUPER_ADMIN]: ['*'],
  [ROLES.MANAGER]: ['view_all_reports', 'manage_team', 'view_dashboard'],
  [ROLES.TEAM_MEMBER]: ['create_reports', 'edit_own_reports', 'view_own_reports']
};

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  APPROVAL_STATUS,
  PERMISSIONS
};