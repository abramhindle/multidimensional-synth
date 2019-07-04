import PySimpleGUI as sg
import random
import scipy.optimize
import numpy
import liblo
import PIL
import PIL.Image, PIL.ImageTk
import tkinter as tk

dims = 10


def sphere(x):
    return numpy.sum(numpy.square(x)) - 1.0

def cube(x):
    return numpy.max(numpy.absolute(x)) - 1.0

def octohedron(x):
    return numpy.sum(numpy.absolute(x)) - 1.0

def hyperpara(x):
    return numpy.sum(-1.0*numpy.square(x))/x[0] - 1.0

def sinewavebits(x):
    return numpy.sum(numpy.sin(x))

surface = sphere

def dpoint(n):
    return numpy.zeros(n)

def bounds(x,b=0.01):
    return (x-b,x+b)

def fixbounds(x,i,b=0.01):
    t = x[i]
    lower = x-b
    upper = x+b
    lower[i] = t # allow a little wiggle room
    upper[i] = t
    return (x-b,x+b)

def randompoint(n):
    return numpy.random.uniform(low=-1.0, high=1.0, size=(n,))

def random_surface_point(n):
    p = randompoint(n)
    v = scipy.optimize.least_squares(surface, p)
    return v.x


def update_point(dims, pt, i, value):
    xnew = pt
    xnew[i] = value
    v = scipy.optimize.least_squares(surface, xnew, bounds=fixbounds(xnew,i,0.1))
    print(surface(v.x))
    xnew = v.x
    return xnew


minslider = -1.1
maxslider =  1.1
dflres = 0.01

w=680
h=680

layout = [
    [sg.Button('Randomize',key="randomize"),sg.Button('Mutate',key="mutate")],
    map(lambda i: sg.Slider(key="slider{0:02d}".format(i),range=(minslider, maxslider), resolution=dflres, orientation='v', size=(10, 20), default_value=0, enable_events=True) , list(range(0,dims))),
#
#        [
#        sg.Slider(key="slider00",range=(minslider, maxslider), resolution=dflres, orientation='v', size=(10, 20), default_value=0, enable_events=True),
#        sg.Slider(key="slider01",range=(minslider, maxslider), resolution=dflres, orientation='v', size=(10, 20), default_value=0, enable_events=True),
#        sg.Slider(key="slider02",range=(minslider, maxslider), resolution=dflres, orientation='v', size=(10, 20), default_value=0, enable_events=True),
#        sg.Slider(key="slider03",range=(minslider, maxslider), resolution=dflres, orientation='v', size=(10, 20), default_value=0, enable_events=True),
#        sg.Slider(key="slider04",range=(minslider, maxslider), resolution=dflres, orientation='v', size=(10, 20), default_value=0, enable_events=True),
#        sg.Slider(key="slider05",range=(minslider, maxslider), resolution=dflres, orientation='v', size=(10, 20), default_value=0, enable_events=True),
#        sg.Slider(key="slider06",range=(minslider, maxslider), resolution=dflres, orientation='v', size=(10, 20), default_value=0, enable_events=True),
#        sg.Slider(key="slider07",range=(minslider, maxslider), resolution=dflres, orientation='v', size=(10, 20), default_value=0, enable_events=True),
#        sg.Slider(key="slider08",range=(minslider, maxslider), resolution=dflres, orientation='v', size=(10, 20), default_value=0, enable_events=True),
#        sg.Slider(key="slider09",range=(minslider, maxslider), resolution=dflres, orientation='v', size=(10, 20), default_value=0, enable_events=True)
    [sg.Canvas(size=(w, h), key='graph')]
]

window = sg.Window('10d Sphere', layout, auto_size_text=True, default_element_size=(40, 1))

graph = window.FindElement('graph')
done = False

img = PIL.Image.new( 'RGB', (w,h), "black")
pixels = img.load() # create the pixel map

def clamp(minn,maxx,v):
    return max(minn,min(maxx,v))

lr = 100
lg = 100
lb = 100
def draw_on_graph(dims,xnew,canvas,pixels,w,h):
    global lr
    global lg
    global lb
    wi = w / dims
    hi = h / dims
    lg += 5
    if (lg > 255):
        lg = 100
        lr += 5
    if (lr > 255):
        lr = 100
        lg = 100
    for i in range(0,dims):
        for j in range(i,dims):
            x = xnew[j]
            y = xnew[i]
            xi = clamp(0,w-1,int(i * wi + wi/2 + wi*x/2))
            yi = clamp(0,h-1,int(j * hi + hi/2 + hi*y/2))
            pixels[xi,yi] = (lr,lg,lb)#.put('#FF0000',(xi,yi,xi+3,yi+3))
            pixels[yi,xi] = (lr,lg,lb)#.put('#FF0000',(xi,yi,xi+3,yi+3))
            


def update_sliders(window,xnew,dims=dims):
    for i in range(0,dims):
        sid = 'slider{0:02d}'.format(i)
        window.Find(sid).Update(value=xnew[i])

def mutate(dims,xnew):
    i = random.randint(0,dims-1)
    v = max(-1.0,min(1.0, xnew[i] + random.uniform(-0.05,0.05)))
    return update_point(dims, xnew, i, v)

xnew = random_surface_point(dims)
update_sliders(window,xnew,dims)


target = liblo.Address(57120)
def send_osc(path,*args):
    global target
    return liblo.send(target, path, *args)

def send_point(point,prefix="/point"):
    send_osc(prefix, *list(point))

canvas = None
    
while True:
    event, values = window.Read()
    if canvas is None:
        canvas = graph.TKCanvas
    if event is None:
        break
    elif event == "randomize":
        xnew = random_surface_point(dims)        
        update_sliders(window,xnew,dims)
        send_point(xnew)
    elif event == "mutate":
        xnew = mutate(dims,xnew)        
        update_sliders(window,xnew,dims)
        send_point(xnew)
    else:
        if "slider" in event:
            iid = int(event[-2:])
            xnew = update_point(dims, xnew, iid, values[event])
            update_sliders(window,xnew,dims)
            send_point(xnew)
    canvas.delete("all")
    draw_on_graph(dims,xnew,canvas,pixels,w,h)
    photo = PIL.ImageTk.PhotoImage(img)
    canvas.create_image(0, 0, image=photo, anchor=tk.NW)
