

import sys
if sys.version_info[0] >= 3:
    import PySimpleGUI as sg
else:
    import PySimpleGUI27 as sg

import random

layout = [[sg.Text('Animated Matplotlib', size=(40, 1), justification='center', font='Helvetica 20')],
          [sg.Graph(canvas_size=(640, 480), graph_bottom_left=(-1,-1), graph_top_right=(1,1), key='graph')],
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

while not done:
    event, values = window.Read(timeout=1)
    if event == "exit":
        done = True
    x += random.uniform(-0.05,0.05)
    y += random.uniform(-0.05,0.05)
    y = max(-1,min(1,y))
    x = max(-1,min(1,x))
    graph.DrawPoint((x,y),color='#{0:02X}{1:02X}{2:02X}'.format(r,g,b))
    b += 1
    if b > 255:
        b = 0
        g += 1
    if g > 255:
        g = 0
        r += 1
    if r > 255:
        r = g = b = 0
