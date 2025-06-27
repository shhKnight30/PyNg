// import { transporter } from "../config/nodemailer/mailer";

// const sendOtpMail = async(mailReceiver,otp)=>{
//     const mailOptions = {   
//         from : `${process.env.EMAIL_FROM}`, 
//         to:mailReceiver,
//         subject: 'Your PYNGapp OTP Code',
//         html: `
//       <h3>Your OTP Code</h3>
//       <p>Use this OTP to verify your account:</p>
//       <h2>${otp}</h2>
//       <p>This OTP will expire in 5 minutes.</p>
//     `,
//     }
//     try {
//         const transpotedMail = await transporter.sendMail(mailOptions)
//         console.log(transpotedMail.response)
//     } catch (error) {
//         console.log("ERROR while sending mail",error)
//     }
// }
    