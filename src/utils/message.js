const generateMessage=(message,username)=>{
    return {
        user:username,
        text:message,
        createdAt:new Date().getTime()
    }
}

const generateLocationMessage=(url,username)=>{
    return{
        user:username,
        url,
        createdAt:new Date().getTime()
    }
}

module.exports={
    generateMessage,
    generateLocationMessage
}