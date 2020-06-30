

function ValidateEmail(mail)
{
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
    {
        return (true)
    }
        // alert("You have entered an invalid email address!")
        return (false)
}
module.exports.validateEmail = ValidateEmail;

function getDomain(email=''){
    if(ValidateEmail(email)){
        return email.split('@')[1]
    }
    return '';
}
module.exports.getDomain = getDomain;