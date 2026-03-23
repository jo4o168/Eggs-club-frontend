export enum UserRole {
    Client = 0,
    Producer = 1,
}

export function getUserType(role: number): "customer" | "producer" {
    return role === UserRole.Producer ? "producer" : "customer";
}
