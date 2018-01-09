import eel

eel.init('staticweb')


@eel.expose
def my_python_function(a, b):
    print(a, b, a + b)
    return a + b


eel.start(
    'main.html', options={
        'port': 9090,
    })

