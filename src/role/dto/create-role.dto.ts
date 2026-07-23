export class CreateRoleDto {
    code!: string;
    name!: string;
    description!: string | null;
    is_active!: boolean;
}
