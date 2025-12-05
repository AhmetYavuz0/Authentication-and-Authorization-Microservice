import {
    mysqlTable,
    text,
    varchar,
    timestamp,
    serial,
} from "drizzle-orm/mysql-core";

export const logsTable = mysqlTable("logs", {

    id: serial("id").primaryKey(),
    agentHostname: varchar("agentHostname", { length: 100 }),
    agentID: varchar("agentID", { length: 100 }),
    filePath: varchar("logFilePath", { length: 150 }),
    serverName: varchar("serverName", { length: 100 }),
    agentName: varchar("agentName", { length: 100 }),
    agentType: varchar("agentType", { length: 50 }),
    agentVersion: varchar("agentVersion", { length: 20 }),
    hostName: varchar("hostname", { length: 100 }),
    inputType: varchar("inputType", { length: 25 }),
    offset: varchar("logOffset", { length: 25 }),
    tags: varchar("tags", { length: 100 }),
    message: text("message"),
    createdAt: timestamp("createdAt", { mode: 'string' })
        .defaultNow()
        .notNull(),
});

