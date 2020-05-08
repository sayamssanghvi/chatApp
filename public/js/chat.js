const socket=io();

var $messageForm=document.querySelector('#messageForm');
var $messageFormInput=$messageForm.querySelector('input');
var $messageFormButtton=$messageForm.querySelector('button')
var $locationButton = document.querySelector("#send_Location");
var $message=document.querySelector('#message');

var messageTemplate=document.querySelector('#message-template').innerHTML;
var locationTemplate=document.querySelector('#location-template').innerHTML;
var sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

const {username,room}=Qs.parse(location.search,{ ignoreQueryPrefix:true})

const autoscroll=()=>{
    //New message element 
    const $newMessage=$message.lastElementChild

    //Height of new Message
    const newMessageStyles=getComputedStyle($newMessage);
    const newMessageMargin=parseInt(newMessageStyles.marginBottom);
    const newMessageHeight=$newMessage.offsetHeight + newMessageMargin;

    //Visible Height
    const visibleHeight=$message.offsetHeight;

    //Total Container Height
    const containerHeight=$message.scrollHeight;
    console.log(containerHeight);
    //how far have we scrlled
    const scrollOffset=$message.scrollTop+visibleHeight;

    if(containerHeight-newMessageHeight<=scrollOffset)
    {
        $message.scrollTop=$message.scrollHeight;
    }
}

socket.on('locationMessage',(geo)=>{
    console.log(geo)
    const html=Mustache.render(locationTemplate,{geo:geo.url,createdAt:moment(geo.createdAt).format('h:mm a'),username:geo.user});
    $message.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

socket.on("Welcome",(message)=>{
    console.log(message);
    const html=Mustache.render(messageTemplate,{message:message.text,createdAt:moment(message.createdAt).format('h:mm a'),username:message.user});
    $message.insertAdjacentHTML('beforeend',html);
    autoscroll();
})

socket.on("roomData",({room,users})=>{
    
    console.log(room,users);
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML=html;

})

$messageForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    $messageFormButtton.setAttribute('disabled','disabled');
    let message=e.target.elements.text.value;
    
    socket.emit("sendMessage",message,(error)=>{
        $messageFormInput.value='';
        $messageFormInput.focus();
        $messageFormButtton.removeAttribute("disabled");
        if(error)
            return console.log(error);
        console.log("Message Delivered");
    });
})

$locationButton.addEventListener('click',(e)=>{
    e.preventDefault();
    if(!navigator.geolocation)
        return console.log("Geolocation is not supported on your browser");
        
        $locationButton.setAttribute("disabled", "disabled");
        let geo;

    navigator.geolocation.getCurrentPosition((position,error)=>{
        if(error)
            return console.log(error);
        
        geo=`https://google.com/maps?q=${position.coords.latitude},${position.coords.longitude}`; 
        socket.emit("sendLocation", geo,(message)=>{
            console.log("Location Shared ");
            $locationButton.removeAttribute('disabled');
        });
    })
})

socket.emit('join',{username,room},(error)=>{
    if(error)
        {
            alert(error);
            location.href = "/";
        }
});