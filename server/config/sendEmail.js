import {Resend} from "resend";
import dotenv from "dotenv";
dotenv.config();

if(!process.env.RESEND_API){
    throw new Error("please provide the resend api key inside .env file");
}

const resend = new Resend(process.env.RESEND_API);

const sendEmail = async({send_to, subject, html})=>{
    try {
        const { data, error } = await resend.emails.send({
        from: 'MyCart <onboarding@resend.dev>',
        to: send_to,
        subject: subject,
        html: html,
        });

        if (error) {
        return console.error({ error });
        }

        return data;

    } catch (error) {
        console.log(error)
    }
}

export default sendEmail;   

