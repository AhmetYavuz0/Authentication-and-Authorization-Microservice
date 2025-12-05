import {type FastifyInstance, type FastifyRequest} from "fastify";
import {crudService, filter} from "./services/crudService.js";
import {userService} from "./services/userService.js";
import {db} from "./src/index.js";
import {userTable} from "./src/db/usersSchema.js";
import {eq} from "drizzle-orm";


export interface JWTPayload {
    id: number;
    email: string;
    password: string;
    username: string;
    role: string;
}

export async function protectedRoutes(server: FastifyInstance){

    server.addHook("onRequest", async (req, reply) => {
        try {
            const user :JWTPayload = await req.jwtVerify()
            const isExist = await db.select().from(userTable).where(eq(userTable.id,user.id)).limit(1)
            if (!isExist || isExist.length === 0){
                reply.clearCookie('token',{
                    path:'/',
                    sameSite:'lax',
                    httpOnly:true,
                })
                return reply.code(401).send({
                    status: 401,
                    message: "Hesap silinmiş, oturum kapatıldı."
                });
            }
        }
        catch (error) {
            reply.send(error);
        }
    })

    server.get('/api/me', async (req, reply) => {
        try {
            const user = await req.jwtVerify()
            return reply.send(user)
        } catch (err) {
            return reply.status(401).send({ error: 'Unauthorized' })
        }
    })

    server.post('/api/logout', async (req, reply) => {
        reply.clearCookie('token', {
            path: '/',
            sameSite: 'lax',
            httpOnly: true
        });

        return reply.send({message: "Çıkış yapıldı" });
    });

    server.get("/api/logs", async (req: FastifyRequest<{
        Querystring: {
            baslangic?: string;
            bitis?: string;
            serverName?:string;
        };
    }>, reply) => {
        const { baslangic, bitis,serverName } = req.query;
        const data = await crudService.getLogs(filter(baslangic, bitis,serverName));
        return reply.send(data)
    });

    server.delete('/api/logs/:id', async (request: FastifyRequest<{
        Params:{id:number}
    }>
        , reply) =>{
        if (!request.params.id){return 'id hatası'}
        const user : JWTPayload = await request.jwtVerify()
        const result = await crudService.deleteLogs(request.params.id,user.role)
        return reply.send(result)

    })

    server.get('/api/users/:id', async (req: FastifyRequest<{
        Params:{id:number}
    }>,reply) =>{
        const result = await userService.getUsers(req.params.id);
        return reply.send(result)
    })

    server.delete('/api/users/:id', async (req: FastifyRequest<{
        Params:{id:number}
    }>,reply) =>{
        const user : JWTPayload = await req.jwtVerify()
        const result = await userService.deleteUser(req.params.id,user.role);
        return reply.send(result)
    })

    server.patch('/api/users/:id', async (req: FastifyRequest<{
        Params:{id:number},
        Body:{
            username?:string,
            password?:string,
            email?:string,
            role?:string
        }
    }>,reply) =>{

        const data = req.body
        const user : JWTPayload = await req.jwtVerify()
        if (Object.keys(data).length === 0){
            return reply.code(400).send({message:"Veri bulunamadı"})
        }
        const res = await userService.updateUser(req.params.id,data,user.role)
        return reply.send(res)
    })



}