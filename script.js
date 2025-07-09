const btnClose = document.querySelector('[data-closeModal]'),
    dialog = document.querySelector('.modal'),
    btnNoTime = document.querySelector('[data-noTime]'),
    modalVivod = document.querySelector('.modal__title'),
    modalBox = document.querySelector('.modal__box')

btnClose.addEventListener('click', () => dialog.close())
dialog.addEventListener('keyup', (e) => {if (e.code === 'Escape') dialog.close()})
dialog.addEventListener('click', (e) => {if (e.target === dialog) dialog.close()})

const formReg = document.forms.regForm,
    formLog = document.forms.LogForm,
    btnSignIn = document.querySelector('#btnSignIn'),
    btnSignUp = document.querySelector('#btnSignUp'),
    info = document.querySelector('.info'),
    signForm = document.querySelector('.sign__container'),
    infoTitle = document.querySelector('.info__title')

formReg.classList.add('active')

async function checkUserExists(newUser, callback) {
    try {
        let users = await fetch('https://moviesearch-666-default-rtdb.firebaseio.com/users.json')
        users = await users.json()
        const keys = Object.keys(users);
        let userExists = false
        for (const key of keys) {
            if (users[key].login === newUser.login || users[key].email === newUser.email) {
                userExists = true
                break
            }
        }
        callback(userExists)
    } 
    catch (err) {
        console.log('error')
        callback(false)
    }
}

formReg.addEventListener('submit', (event) => {
    event.preventDefault()
    const newUser = {
        login: formReg.login.value,
        password: formReg.password.value,
        email: formReg.email.value,
    }
    checkUserExists(newUser, (exists) => {
        if (exists) {
            modalVivod.textContent = "A user with this login, email or phone number already exists!";
            dialog.showModal();
        } else {
            fetch('https://moviesearch-666-default-rtdb.firebaseio.com/users.json', {
                method: 'POST',
                headers: {
                    "Content-type": "application/json"
                },
                body: JSON.stringify(newUser)
            })
            .then(() => formReg.reset())
            .catch(() => console.log('Error'))
        }
    });
})

async function checkUserData(loginOrEmail, password, callback) {
    try {
        let users = await fetch('https://moviesearch-666-default-rtdb.firebaseio.com/users.json')
        users = await users.json()
        const keys = Object.keys(users);
        let userFound = false
        for (const key of keys) {
            if ((users[key].login === loginOrEmail || users[key].email === loginOrEmail) && users[key].password === password) {
                userFound = true
                break
            }
        }
        callback(userFound)
    } 
    catch (err) {
        console.log('error')
        callback(false)
    }
}

formLog.addEventListener('submit', (event) => {
    event.preventDefault();

    const loginOrEmail = formLog.login.value;
    const password = formLog.password.value;

    let userData = [loginOrEmail, password]
    localStorage.setItem("user", JSON.stringify(userData))
    
    checkUserData(loginOrEmail, password, (userFound) => {
        if (userFound) {
            window.location.href = 'movieSearch.html'
            formReg.reset()
            formLog.reset()
        } else {
            modalVivod.textContent = 'Invalid login or password!'
            dialog.showModal()
        }
    })
})

btnSignIn.addEventListener('click', () => {
    formLog.classList.add('active')
    formReg.classList.remove('active')
    
    signForm.classList.add('start-left')
    info.classList.add('start-right')
    signForm.classList.remove('left-start')
    info.classList.remove('right-start')
    setTimeout(() => {
        infoTitle.textContent = 'Log in to your Account'
        formReg.reset()
    }, 300)
})
btnSignUp.addEventListener('click', () => {
    formReg.classList.add('active')
    formLog.classList.remove('active')
    
    signForm.classList.remove('start-left')
    info.classList.remove('start-right')
    signForm.classList.add('left-start')
    info.classList.add('right-start')
    setTimeout(() => {
        infoTitle.textContent = 'Create your Account'
        formLog.reset()
    }, 300)
})