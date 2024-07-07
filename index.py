import matplotlib.pyplot as plt
import numpy as np
import requests
from colorama import Fore, Back, Style

token = None

def title(text, underline= "-"):
    print(Fore.BLUE + underline * len(text))
    print(Fore.BLUE + text)
    print(Fore.BLUE + underline * len(text))
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
        print()
        token = response.json()["token"]
        return token
    else:
        print("Erro ao logar usuário!")
        erro = response.json()
        print("="*40)
        print(Fore.RED, erro['erro'], Style.RESET_ALL)
        print("="*40)
        return None

def list_series():
    url = "http://localhost:3000/series"
    response = requests.get(url)
    series = response.json()
    if response.status_code == 200:
        print("=" * 40)
        for serie in series:
           print(f"{serie['id']} - {serie['name']} ({serie['seasons']} temporadas) - {serie['genre']} - {serie['streaming']}")
        print("=" * 40)
        
    elif response.status_code == 404:
        print("Nenhuma série encontrada!")
    elif len(series) == 0:
        print("Nenhuma série cadastrada!")
    else:
        print("Erro ao buscar séries!")
        erro = response.json()
        print("=" * 40)
        print(erro)
        print("=" * 40)

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

def update_serie(token):
    title("Atualização de Série", "-")
    list_series()
    id = input("ID da Série: ")
    url = f"http://localhost:3000/series/{id}"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        serie = response.json()
        print("Série encontrada!")
        print(serie["name"], serie["genre"], serie["streaming"], serie["seasons"])
        option = input("Deseja atualizar a série? (s/n) ")
        if option == "s":
            serie["name"] = input("Nome da Série: ")
            serie["seasons"] = int(input("Quantidade de Temporadas: "))
            serie["genre"] = input("Gênero: ")
            serie["streaming"] = input("Streaming: ")
            response = requests.put(url, json=serie, headers=headers)
            if response.status_code == 200:
                print("Série atualizada com sucesso!")
            else:
                print("Erro ao atualizar série!")
                erro = response.json()
                print("=" * 40)
                print(erro)
                print("=" * 40)
        else:
            print("Operação cancelada!")
    else:
        print("Série não encontrada!")
        erro = response.json()
        print("=" * 40)
        print(erro)
        print("=" * 40)

def delete_serie(token):
    title("Exclusão de Série", "-")
    list_series()
    id = int(input("Codigo da Série: "))

    response = requests.delete(f"http://localhost:3000/series/{id}", headers = {"Authorization": f"Bearer {token}"})
    if response.status_code == 200:
        print("Série excluída com sucesso!")
    else:
        print("Erro ao excluir série!")
        erro = response.json()
        print("=" * 40)
        print(erro)
        print("=" * 40)

def series_by_streaming():
    title("Séries por Streaming", "-")
    url = "http://localhost:3000/series"
    response = requests.get(url)
    series = response.json()

    if response.status_code == 200 and len(series) > 0:
        streaming_dict = {}
        for serie in series:
            streaming = serie["streaming"]
            if streaming not in streaming_dict:
                streaming_dict[streaming] = []
            streaming_dict[streaming].append(serie)

        sorted_streamings = sorted(streaming_dict.items(), key=lambda x: len(x[1]), reverse=True)

        for streaming, series_list in sorted_streamings:
            print(f"{streaming}: Quantidade de séries {len(series_list)}")
            for serie in series_list:
                print(f"  - {serie['name']} ({serie['seasons']} temporadas) - {serie['genre']}")
            print("=" * 40)
    else:
        print("Erro ao buscar séries ou nenhuma série encontrada!")
        erro = response.json()
        print("=" * 40)
        print(erro)
        print("=" * 40)

def graphic():
    title("Gráfico Comparativo", "-")
    url = "http://localhost:3000/series"
    response = requests.get(url)
    series = response.json()

    if response.status_code == 200 and len(series) > 0:
        names = [serie["name"] for serie in series]
        seasons = [serie["seasons"] for serie in series]

        plt.figure(figsize=(10, 5))
        plt.barh(names, seasons, color='skyblue')
        plt.xlabel("Temporadas")
        plt.ylabel("Séries")
        plt.title("Número de Temporadas por Série")
        plt.grid(axis='x', linestyle='--', alpha=0.7)
        plt.show()
    else:
        print("Erro ao buscar séries ou nenhuma série encontrada!")
        erro = response.json()
        print("=" * 40)
        print(erro)
        print("=" * 40)

#--------------------------- Main ---------------------------


while True:
    if token is None:
        print("1 - Registrar")
        print("2 - Login")
        option = input("Opção: ")
        
        if option == "1":
            register()
        elif option == "2":
            token = login()
        else:
            print("Opção inválida!")
    else:
        print("1 - Listar Séries")
        print("2 - Incluir Série")
        print("3 - Atualizar Série")
        print("4 - Excluir Série")
        print("5 - Gráfico")
        print("6 - Series por Streaming")
        print("0 - Sair")
        option = input("Opção: ")
        
        if option == "1":
            list_series()
        elif option == "2":
            inclusion(token)
        elif option == "3":
            update_serie(token)
        elif option == "4":
            delete_serie(token)
        elif option == "5":
            graphic()
        elif option == "6":
            series_by_streaming()
        elif option == "0":
            break
        else:
            print("Opção inválida!")