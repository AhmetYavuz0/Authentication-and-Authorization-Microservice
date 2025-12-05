import Fastify, {type FastifyRequest} from 'fastify';
import cors from '@fastify/cors'
import {crudService} from "./services/crudService.js";
import fastifyJwt from "@fastify/jwt";
import {userService} from "./services/userService.js";
import cookie from '@fastify/cookie';
import {type JWTPayload, protectedRoutes} from "./protectedRoutes.js";

const server = Fastify();

server.register(cookie,{
    secret: "mobi",
    hook:"onRequest"
})
server.register(cors, {
    origin:true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
});
server.register(fastifyJwt, {
    secret:"mobiversite",
    cookie: {
        cookieName: 'token',
        signed:false
    }
})
server.register(protectedRoutes)


server.post('/api/users', async (req: FastifyRequest<{
    Body:{
        username:string,
        password:string,
        email:string,
        role:string | "user",
    }
}>, reply) =>{ //register
    const data = req.body;
    const user:JWTPayload = await req.jwtVerify()
    const result = await userService.createUser(req.body.username,req.body.password,req.body.email,req.body.role,user.role);
    return reply.send(result)
})

server.post('/api/logs', async (req, reply) => {

    let log = req.body as any;
    const data = await crudService.postLogs(log)
    return reply.send(data)
});


server.post('/api/login', async (req: FastifyRequest<{
    Body:{
        username:string,
        password:string,
    }
}>
    , reply) =>{
    const data = req.body;
    const result = await userService.login(server,data.username,data.password);
    if (result.status === 200 && result.token) {

        reply.setCookie('token', result.token, {
            path: '/',
            httpOnly: true,
            secure: false,      // it must be true at https
            sameSite: 'lax',
            maxAge: 86400       // 1 day
        });
        return reply.status(200).send({
            status: 200,
            message: "Giriş başarılı"
        });
    }
    return reply.send(result)
})



server.listen({ port: 4000, host:'0.0.0.0' }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`API çalışıyor: ${address}`);
});