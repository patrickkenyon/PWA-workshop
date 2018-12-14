window.addEventListener('online', updateStatus)
window.addEventListener('offline', updateStatus)
document.addEventListener('DOMContentLoaded', updateStatus)

function updateStatus () {

    // disable adding todos when offline
    document.querySelector('button').disabled = !navigator.onLine
    document.querySelectorAll('.todo input').forEach(function(input) {
        input.disabled = !navigator.onLine
    })

    // display offline message
    if (navigator.onLine === false) {
        document.querySelector('.offline').innerHTML = 'You are currently offline, your data might not be up to date. Go and play with cats.'
    } else {
        document.querySelector('.offline').innerHTML = ''
    }
}

function loadTodos() {
    fetch('/api/todo').then(function (data) {
        return data.json()
    }).then(function (todos) {
        var todoEl = document.querySelector('.todos');
        if (todos.success) {
            document.querySelector('.todos').innerHTML = '';
            todos.data.forEach(function (todo) {
                if (todo[0]) {
                    var todoContent = todoEl.innerHTML
                    todoEl.innerHTML = todoContent + '<div class="todo">' + todo[1] + '<input type="checkbox" value="' + todo[0] + '"></div>'
                }
            })

            document.querySelectorAll('input[type="checkbox"]').forEach(function(checkbox) {
                checkbox.onclick = function() {
                    var todo = {done : this.value};

                    fetch('/api/todo', {
                        method: "POST",
                        body: JSON.stringify(todo),
                        headers: new Headers({
                            'Content-Type': 'application/json'
                        })
                    }).then(function(data) {
                        return data.json()
                    }).then(function(data) {
                        if (data.success) {
                            loadTodos();
                        } else {
                            alert('something broke')
                        }
                    })
                }
            })

        }
    })
}

loadTodos();

document.querySelector('button').onclick = function() {
    var todo = {todo : document.getElementsByName('todo')[0].value};

    fetch('/api/todo', {
        method: "POST",
        body: JSON.stringify(todo),
        headers: new Headers({
            'Content-Type': 'application/json'
        })
    }).then(function(data) {
        return data.json()
    }).then(function(data) {
        if (data.success) {
            document.getElementsByName('todo')[0].value = ''
            loadTodos();
        } else {
            alert('something broke')
        }
    })
}
