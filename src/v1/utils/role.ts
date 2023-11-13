export const Role = {
    SuperAdmin: 'SuperAdmin',
    Admin: 'Admin',
    User: 'User'
}

export const isSingleRole = (user_roles: string[], role_name: string) => {
	if ((user_roles.includes(role_name)) && (user_roles.length === 1)) return true;
	else return false;
}