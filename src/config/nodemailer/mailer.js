import nodemailer from 'nodemailer'
import { emailFrom,emailPass } from './index.js'
try {
    const transporter = nodemailer.createTransport({
        service:'yahoo',
        auth:{
            user:emailFrom,
            pass:emailPass
        }
    })
} catch (error) {
  console.log("error while creating a transport ", error)  
}

export {transporter}