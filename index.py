import matplotlib.pyplot as plt
import numpy as np
import requests
from colorama import Fore, Back, Style
# Rota para registrar usuario 
# "http://localhost:3000/register"

token = None

def title(texto, sublinhado= "-"):
    print(Fore.BLUE + sublinhado * len(texto))
    print(Fore.BLUE + texto)
    print(Fore.BLUE + sublinhado * len(texto))
    print(Style.RESET_ALL)

def register():
    title("Cadastro de Usuário", "-")
    user = {}
    user["name"] = input("Nome: ")
    user["email"] = input("Email: ")
    user["password"] = input("Senha: ")
    url = "http://localhost:3000/register"
    response = requests.post(url, json=user)
    if response.status_code == 201:
        print("Usuário cadastrado com sucesso!")
    else:
        print("="*40)
        print("Erro ao cadastrar usuário!")
        erro = response.json()
        print(Fore.RED, erro['erro'], Style.RESET_ALL)
        print("="*40)

def login():
    title("Login de Usuário", "-")
    email = input("Email: ")
    password = input("Senha: ")
    url = "http://localhost:3000/login"
    response = requests.post(url, json={"email": email, "password": password})
    if response.status_code == 200:
        print("Usuário logado com sucesso!")
        token = response.json()["token"]
        return token
    else:
        print("Erro ao logar usuário!")
        erro = response.json()
        print("="*40)
        print(Fore.RED, erro['erro'], Style.RESET_ALL)
        print("="*40)
        return None

def inclusion(token):
    print(token)
    title("Inclusão de Série", "-")
    serie = {}
    serie["name"] = input("Nome da Série: ")
    serie["seasons"] = int(input("Quantidade de Temporadas: "))
    serie["genre"] = input("Gênero: ")
    serie["streaming"] = input("Streaming: ")

    url = "http://localhost:3000/series"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.post(url, json=serie, headers=headers)
    
    if response.status_code == 201:
        print("Série incluída com sucesso!")
    else:
        print("Erro ao incluir série!")
        erro = response.json()
        print("=" * 40)
        print(erro)
        print("=" * 40)


def graphic():
    title("Gráfico de Séries", "-")
    url = "http://localhost:3000/series"
    response = requests.get(url)
    series = response.json()
    genres = {}
    for serie in series:
        genre = serie["genre"]
        if genre in genres:
            genres[genre] += 1
        else:
            genres[genre] = 1
    print(genres)
    x = genres.keys()
    y = genres.values()
    plt.bar(x, y)
    plt.show()

#--------------------------- Main ---------------------------

while True:
    if token is None:
        print("1 - Registrar")
        print("2 - Login")
    if token is not None:
        print("3 - Incluir Série")
        print("4 - Gráfico")
    option = input("Opção: ")
    if option == "1":
        register()
    elif option == "2":
        token = login()
    elif option == "3" and token is not None:
        inclusion(token)
    elif option == "4" and token is not None:
        graphic()
    elif option == "0":
        break
    else:
        print("Opção inválida!")