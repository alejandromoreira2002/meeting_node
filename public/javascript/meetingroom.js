window.onload = () => {
    const roomname = document.querySelector('#roomname-value').innerText;
    const token = localStorage.getItem('token');
    fetch(`/meeting/room`, {
        method: 'POST',
        headers: {
            'Authorization': token,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({'roomname': roomname})
    })
    .then((data) => {
        if(data['status'] == 200){
            const api = new JitsiMeetExternalAPI("8x8.vc", {
                roomName: `vpaas-magic-cookie-16adeb346a2f47589db75f5c97b524fb/${roomname}`,
                parentNode: document.querySelector('#jaas-container'),
                jwt: data['token']
            });
            document.querySelector('#loading-info-container').classList.remove('lic-open');
        }else{ 
            document.querySelector('#loading-info-msg-h').innerText = 'No Autorizado';
            let infoBody = document.querySelector('#loading-info-msg-b');
            infoBody.innerText = 'Usted no tiene permiso para entrar a esta reunion';
            infoBody.removeAttribute('hidden');
        }
    })
    .catch((err) => {
        document.querySelector('#loading-info-msg-h').innerText = 'Ocurrió un error inesperado';
        let infoBody = document.querySelector('#loading-info-msg-b');
        infoBody.innerText = `Error: ${err}`;
        infoBody.removeAttribute('hidden');
    })
}