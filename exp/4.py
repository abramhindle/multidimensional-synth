import scipy.optimize
import numpy


import sys
if sys.version_info[0] >= 3:
    import PySimpleGUI as sg
else:
    import PySimpleGUI27 as sg

import random

dims = 10

layout = [[sg.Text('Animated Matplotlib', size=(40, 1), justification='center', font='Helvetica 20')],
          [sg.Graph(canvas_size=(640, 480), graph_bottom_left=(0,0), graph_top_right=(dims,dims), key='graph')],
          [sg.ReadButton('Exit', key="exit",size=(10, 2), pad=((280, 0), 3), font='Helvetica 14')]]

window = sg.Window('Demo Application - Embedding Matplotlib In PySimpleGUI').Layout(layout).Finalize()
graph = window.FindElement('graph')
graph.DrawPoint((0,0),color="red")
x = 0
y = 0
done = False
r = 0
g = 0
b = 0

def randompoint(n):
    return numpy.random.uniform(low=-1.0, high=1.0, size=(n,))

def mutate(dims,xnew):
    i = random.randint(0,dims-1)
    v = max(-1.0,min(1.0, xnew[i] + random.uniform(-0.1,0.1)))
    xnew[i] = v
    return xnew

point = randompoint(10)

def draw_on_graph(dims,xnew,graph):
    for i in range(0,dims):
        for j in range(0,dims):
            x = xnew[j]
            y = xnew[i]            
            graph.DrawPoint((i + x/2 + 0.5, j + y/2 + 0.5),color='#FF00FF')
            
while not done:
    event, values = window.Read(timeout=1)
    if event == "exit":
        done = True
    point = mutate(dims,point)
    print(point)
    draw_on_graph(dims,point,graph)
