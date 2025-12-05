import {db} from "../src/index.js";
import {logsTable} from "../src/db/schema.js";
import {and, desc, eq, gte, lte, or} from "drizzle-orm";

class _crudService {

    async postLogs(log:any)
    {
        if (typeof log === 'string') {
            try {
                log = JSON.parse(log);
            } catch (e) {
                console.error("HATA: Gelen body string ama geçerli JSON değil.");
                return {status:400,message:"Geçersiz JSON formatı."}
            }
        }
        try {
            console.log('API POST isteği alındı.');
            await db.insert(logsTable).values({
                agentHostname: log.agent?.hostname ?? null,
                agentID: log.agent?.id ?? null,
                filePath: log.log?.file?.path ?? null,
                serverName: log.server_name ?? null,
                agentName: log.agent?.name ?? null,
                agentType: log.agent?.type ?? null,
                agentVersion: log.agent?.version ?? null,
                hostName: log.host?.hostname ?? null,
                inputType: log.input?.type ?? null,
                offset: String(log.log?.offset ?? "") ?? null,
                tags: Array.isArray(log.tags) ? log.tags.join(",") : null,
                message: log.message ?? null,
            });
            return ({ status:200, message: "Log başarıyla kaydedildi." });

        } catch (error) {
            console.error('Veritabanına log eklerken hata oluştu:', error);
            throw new Error("Veritabanı hatası");
        }
    }

    async getLogs(conditions :any = []) {
        try {
            return await db.select()
                .from(logsTable)
                .where(
                    conditions.length > 0 ? and(...conditions) : undefined
                )
                .orderBy(desc(logsTable.createdAt));
        } catch (error) {
            console.error(error);
            throw new Error("Veritabanı hatası");        }
    }

    async deleteLogs (id: number, role:string) {
        try {
            if (role !== 'admin') {
                return {status:403,message:"Yetkisiz erişim talebi"}
            }
            const result = await db.delete(logsTable).where(eq(logsTable.id,id))
            return {status: 200, message:"Başarıyla Silindi"}
        } catch (error) {
            console.error(error);
            throw new Error("Veritabanı hatası");
        }
    }
}

export const crudService = new _crudService();

export function filter(baslangic: string | undefined, bitis: string | undefined,serverName:string | undefined,)
{
    const conditions = [];

    if (baslangic) {
        const start = new Date(baslangic);
        if (!isNaN(start.getTime())) {
            conditions.push(
                gte(logsTable.createdAt, start.toISOString())
            );
        }
    }

    if (bitis) {
        const end = new Date(bitis);
        if (!isNaN(end.getTime())) {
            end.setHours(23, 59, 59, 999);
            conditions.push(
                lte(logsTable.createdAt, end.toISOString())
            );
        }
    }
    if (serverName) {
        conditions.push(eq(logsTable.serverName,serverName))


}
    return conditions;
}