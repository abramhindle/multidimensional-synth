import scipy.optimize
import numpy
import tkinter as tk

import sys
if sys.version_info[0] >= 3:
    import PySimpleGUI as sg
else:
    import PySimpleGUI27 as sg

import random
import PIL
import PIL.Image, PIL.ImageTk
dims = 10
w = 500
h = 500
layout = [[sg.Text('Animated Matplotlib', size=(40, 1), justification='center', font='Helvetica 20')],
          [sg.Canvas(size=(w, h), key='graph')],
          [sg.ReadButton('Exit', key="exit",size=(10, 2), pad=((280, 0), 3), font='Helvetica 14')]]

window = sg.Window('Demo Application - Embedding Matplotlib In PySimpleGUI').Layout(layout).Finalize()
graph = window.FindElement('graph')
done = False
canvas = graph.TKCanvas
# photo = tk.PhotoImage(master=canvas, width=w, height=h)
# canvas.create_image(w/2, h/2, image=photo)

img = PIL.Image.new( 'RGB', (w,h), "black")
pixels = img.load() # create the pixel map
photo = PIL.ImageTk.PhotoImage(img)
# canvas.create_image(w/2, h/2, image=photo)
canvas.create_image(0, 0, image=photo, anchor=tk.NW)

def randompoint(n):
    return numpy.random.uniform(low=-1.0, high=1.0, size=(n,))

def mutate(dims,xnew):
    i = random.randint(0,dims-1)
    v = max(-1.0,min(1.0, xnew[i] + random.uniform(-0.1,0.1)))
    xnew[i] = v
    return xnew

point = randompoint(10)

def clamp(minn,maxx,v):
    return max(minn,min(maxx,v))

def draw_on_graph(dims,xnew,canvas,pixels,w,h):
    wi = w / dims
    hi = h / dims
    for i in range(0,dims):
        for j in range(i,dims):
            x = xnew[j]
            y = xnew[i]
            xi = clamp(0,w-1,int(i * wi + wi/2 + wi*x/2))
            yi = clamp(0,h-1,int(j * hi + hi/2 + hi*y/2))
            pixels[xi,yi] = (255,255,255)#.put('#FF0000',(xi,yi,xi+3,yi+3))
            
while not done:
    event, values = window.Read(timeout=10)
    if event == "exit":
        done = True
    point = mutate(dims,point)
    print(point)
    canvas.delete("all")
    draw_on_graph(dims,point,canvas,pixels,w,h)
    photo = PIL.ImageTk.PhotoImage(img)
    canvas.create_image(0, 0, image=photo, anchor=tk.NW)

    # canvas.create_image(w/2, h/2, image=photo)
    # canvas.delete("all")
