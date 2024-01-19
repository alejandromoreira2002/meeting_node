window.onload = () => {
    let meetingAlert = document.querySelector('#meeting-alert-container');
    let confReunion = document.querySelector('#confirmar-reunion');

    document.querySelector('#btn-malert-close').addEventListener('click', () => {
        meetingAlert.classList.remove('mac-open');
        confReunion.removeAttribute('name');
    })

    document.querySelector('#btn-crear-reunion').addEventListener('click', () => {
        document.querySelector('#meeting-alert-opc').innerText = "Nueva";
        confReunion.setAttribute('name', 'conf-crear-reunion');
        confReunion.innerText = "Crear Reunión";
        meetingAlert.classList.add('mac-open');
    })

    document.querySelector('#btn-unirse-reunion').addEventListener('click', () => {
        document.querySelector('#meeting-alert-opc').innerText = "Unirse a una";
        confReunion.setAttribute('name', 'conf-unirse-reunion');
        confReunion.innerText = "Unirse a la Reunión";
        meetingAlert.classList.add('mac-open');
    })

    confReunion.addEventListener('click', () => {
        let confReunionName = confReunion.getAttribute('name');
        let roomname = document.querySelector('#input-room-name').value;
        if(confReunionName == 'conf-crear-reunion'){
            fetch('/meeting/create', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({'roomname': roomname})
            })
            .then(response => response.json())
            .then(data => {
                if(data['status'] == 200){
                    localStorage.setItem('token', data['token']);
                    location.href = `meeting/room/${roomname}`;
                }
            })
            .catch((err) => {
                console.log("Ocurrió un error inesperado. Error: " + err);
            });
        }else if(confReunionName == 'conf-unirse-reunion'){
            location.href = `meeting/room/${roomname}`;
        }
    })
}