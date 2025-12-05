import {db} from '../src/index.js'
import {userTable} from "../src/db/usersSchema.js";
import bcrypt from 'bcrypt'
import { eq, or} from "drizzle-orm";
import {type FastifyInstance} from "fastify";

interface User {
    username?:string;
    password?:string;
    email?:string;
    role?:string;
}

class _userService {

    async getUsers(id?:number){
        try {
           const query = db.select().from(userTable)
            if (id){
                const data = await query.where(eq(userTable.id,id)).limit(1)
                if (data.length === 0){return {status:404,message:"Kullanıcı bulunamadı"}}
                return data
            }
            return query
        }
        catch(err){
            console.log(err)
            return {status:500,message:"Beklenmedik hata"}
        }
    }

    async createUser (username: string, password: string,email: string,role:string,auth:string) {
        if (auth !== 'admin') {return {status:403, message:"Yetkisiz erişim"}}
        if (await isDuplicate(username, email)>0){return {status:409,message:"Kullanıcı zaten kayıtlı"};}
        try {
            const result = await db.insert(userTable).values({
                username: username,
                password: await hashPassword(password),
                email: email,
                role: role || "user",
            })
            return {status:201,message:"Kullanıcı oluşturuldu"}
        }
        catch(err) {
            console.log(err)
            return {status:500,message:"Beklenmedik kayıt hatası"}
        }
    }

    async deleteUser (id: number,role :string) {
        if (role !== 'admin') {return{status:403,message:"Yetkisiz erişim"} }
        try {
            const [result] = await db.delete(userTable).
            where(eq(userTable.id,id))

            if (result.affectedRows === 0) {return {status: 404,message:"Kullanıcı bulunamadı"}}

            return {status:200,message:"Kullanıcı başarıyla silindi"}
        }
        catch (err)
        {
            console.log(err)
            return {status:500,message:"Beklenmedik silme hatası"}
        }
    }

    async login(fastify:FastifyInstance,username: string, password: string) {

        const result = await db.select().from(userTable).
        where(eq(userTable.username,username)).limit(1)
        const user   = result[0]
        if (!user) {return {status:404,message:"Kullanıcı bulunamadı"}}
        try {
            const isMatching =  bcrypt.compareSync(password,user.password)
            if (isMatching) {
                const token = fastify.jwt.sign({id:user.id,username: user.
                            username,email:user.email,role:user.role},
                    {expiresIn: "24h"})
                return {status:200,message:"Giriş başarılı",token:token};
            }
            else return {status:401,message:"Kullanıcı adı veya şifre yanlış"}
        }
        catch(err) {
            console.log(err)
            return {status:500,message:"Giriş başarısız"}
        }
    }

    async updateUser (id: number, data:User,auth:string) {
        if (auth !== 'admin') {return {status:401,message:"Yetkisiz erişim"}}
        console.log(await isDuplicate(data.username,data.email))
        if (await isDuplicate(data.username,data.email)>1)
        {return {status:409,message:"Kullanıcı adı zaten mevcut"}}
        if (data.password){
            data.password = await hashPassword(data.password)
        }
        const user = await db.select().from(userTable).where(eq(userTable.id,id)).limit(1)
        if (user.length === 0) {return {status:404,message:"Kullanıcı bulunamadı"}}
        try {
            const [result] = await db.update(userTable).set(data).where(eq(userTable.id,id))
            if (result.affectedRows === 0) {
                return {status:400,message:"Kullanıcı güncellemesi başarısız"}
            }
            return { status: 200, message: "Kullanıcı başarıyla güncellendi" }
        }
        catch (err){
            console.log(err)
            return {status:500, message:"Beklenmedik veri hatası"}
        }
    }

}

export const userService = new _userService()

async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

async function isDuplicate(username?:string,email?:string){
    const conditions =[]
    if (username){
        conditions.push(eq(userTable.username,username));
    }
    if (email){
        conditions.push(eq(userTable.email,email))
    }
    const result = await db.select().from(userTable).where(or(...conditions))
    return result.length;

}
