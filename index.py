import matplotlib.pyplot as plt
import numpy as np
import requests


def titulo(texto, sublinhado= "-"):
    print()
    print(sublinhado*40)
    
    
def inclusao():
    titulo("Inclusão de Séries", "-")
    serie = {}
    serie["nome"] = input("Nome: ")
    serie["genero"] = input("Gênero: ")
    serie["ano"] = input("Ano: ")
    url = "http://localhost:3000/series"

    
    
def grafico():
    url = "http://localhost:5000/series"
    resposta = requests.get(url)
    series = resposta.json()
    generos = {}
    for serie in series:
        genero = serie["genero"]
        if genero in generos:
            generos[genero] += 1
        else:
            generos[genero] = 1
    print(generos)
    x = generos.keys()
    y = generos.values()
    plt.bar(x, y)
    plt.show()
#------------------------------- programa principal 

while True:
    titulo("Cadastro de Animais do Zoo", "-")
    print("1. Fazer Login")
    print("2. Incluir Séries")
    print("3. Listar Séries")
    print("4. Alterar Dados")
    print("5. Excluir Série")
    print("6. Agrupar por genero e exibir quantidade de series por genero")
    print("7. Grafico comparando as séries por genero")
    print("8. Finalizar")
    opcao = int(input("Opção: "))
    if opcao == 7:
        grafico()
    else:
        break