import {mysqlTable, serial, varchar} from "drizzle-orm/mysql-core";


export const userTable = mysqlTable("users",{
    id: serial("id").primaryKey(),
    username: varchar("username", { length: 100 }).notNull(),
    password: varchar("password", { length: 100 }).notNull(),
    email: varchar("email", { length: 100 }).notNull(),
    role: varchar("role", { length: 100 }).notNull().default('user'),
})