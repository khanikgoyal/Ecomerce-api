const forgotPasswordTemplate = ({name, otp}) => {
    return `
    <div> 
    <p> Hi ${name}, </p>
    <p> We received a request to reset your password. Use the OTP below to reset it. </p>
    <h2 style="font-weight:bold;"> ${otp} </h2>
    </div>
    `
}

export default forgotPasswordTemplate;