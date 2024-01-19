$(document).ready( e => {
    $('#submit-button').on('click', _ => {
        
        let email = $('#email-input').val();
        let password = $('#password-input').val();

        let htmlAlert = "<div class='alert-container' id='alert-container'><div class='alert alert-danger' role='alert' id='alert-txt'>A simple danger alert—check it out!</div></div>";
        let alertElem = document.getElementById('alert-container');
        if(email.trim() == "" || password.trim() == ""){
            let errorAlert = htmlAlert.replace("A simple danger alert—check it out!", "Por favor rellenar campos.");
            if(alertElem != undefined){
                document.getElementById('container-page').removeChild(alertElem);
            }
            $('#container-page').append($(errorAlert));
        }else{
            fetch('/user/login', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({'email': email, 'password': password})
            })
            .then(response => response.json())
            .then(data => {
                if(data['status'] == 200){
                    let successClass = htmlAlert.replace("alert-danger", "alert-success");
                    let successText = successClass.replace("A simple danger alert—check it out!", "Acceso exitoso. Redirigiendo a la pagina principal...");
                    if(alertElem != undefined){
                        document.getElementById('container-page').removeChild(alertElem);
                    }
                    $('#container-page').append($(successText));
                    localStorage.setItem('token', data['token'])
                    setTimeout(() => {
                        location.href ='/';
                    }, "1000");
                }else{
                    let errorAlert = htmlAlert.replace("A simple danger alert—check it out!", data['text']);
                
                    if(alertElem != undefined){
                        document.getElementById('container-page').removeChild(alertElem);
                    }
                    $('#container-page').append($(errorAlert));
                }
            })
            .catch((err) => {
                let errorAlert = htmlAlert.replace("A simple danger alert—check it out!", "Ocurrió un error inesperado. Error: " + err);
                
                if(alertElem != undefined){
                    document.getElementById('container-page').removeChild(alertElem);
                }
                $('#container-page').append($(errorAlert));
            });

        }
    })
});