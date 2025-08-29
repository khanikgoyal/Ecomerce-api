const verifyEmailtemplate = ({name, url})=>{
     return `
        <h2>Welcome to myCart</h2>
        <h4>Hi ${name} </h4>
        <p>Thank you for registering on myCart.</p>
        <a href=${url} style="color:white; background : blue;margin-top:10px; padding :20px;">
            Verfy Email
        </a>
     `
}

export default verifyEmailtemplate;