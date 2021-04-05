//Incorpora Pixi a nuestro juego
let type = "WebGL"
if(!PIXI.utils.isWebGLSupported()){
    type = "canvas"
}

PIXI.utils.sayHello(type)

//Tamaño del canvas
var heightWindow = window.innerHeight;
//console.log(heightWindow);
var width = 700;

//Renombramos para nuestra comodidad
let Application = PIXI.Application,
    loader = PIXI.loader,
    resources = PIXI.loader.resources,
    Text = PIXI.Text,
    TextStyle = PIXI.TextStyle,
    Graphics = PIXI.Graphics;
    renderer = PIXI.autoDetectRenderer(width,heightWindow);

let util = new SpriteUtilities(PIXI);

//JUEGO
let game;
//variable para guardar al jugador
let principal;
//varible para guardar enemigos
let enemigos = [];
//variable para guardar las nubes
let nubecitas = [];
// Ritmo al que se crean los enemigos
let velocidadGenEnemigos = 20;
//let cuentaInfinita = 0;
//Velocidad dada inicialmente al enemigo
let velocidaEstandarEnemigo = 10;
let velocidadEnemigo = 10;
//Velocidad a la que se mueve el jugador de izq a drcha
let velocidadPrincipal = 5;
//Cada vez que se genera un enemigo va a tener un id único
let consecutivoEnemigos = 0;
//Cada vez que se genera una nube va a tener un id unico
let consecutivoNubes = 0;
//Variable para guardar el fondo
let background;
//variable para guardar al coche del jugador
let cars;
//variable para guardar las nubes
let nubes;
let velocidadNubes = 10;
//variable para guardar los distintos coches
let coche_animado;
// guarda el fondo y la velocidad a la que se mueve
let fondo;
let velocidadTileFondo = 15;
let velocidadTileFondoEstandar = 15;
//espacio de los laterales
var laterales = 88;
// posiciones margenes
let margenIzquierdo =  90;
let margenDerecho   = 550;
//Total de coches que adelantamos
var totalCochesAdelantados = 0;
//Niveles
let nivel = 1;
//Sistema puntos
let puntos = 0;
//Sonidos
let soundFondo;
let soundCar;
let soundChoque;
//Control habilidad de relentizar el tiempo;
var cuenta = 0;
var t;
var timer_is_on = false;
//Control cooldown parar el tiempo
var cuentaCooldown = 0;
var tCooldown;
var timer_is_on_cooldown;

//reconocer nuestra teclas
//tuve un problema por declararlo en el init luego reconocia los eventos 2 veces.
let left = keyboard("ArrowLeft"), 
right = keyboard("ArrowRight"),
up = keyboard("ArrowUp");


//cargar sprites, sonidos y su alias
loader.add("pista", "assets/pista.jpg")
    .add("cars", "assets/cars.png")
    .add("nubes", "assets/nubes.png")
    .add("coche_animado", "assets/coche_animado.png")
    .add("assets/coche_animado.json")
    .add("soundFondo", "sound/fondo.mp3")
    .add("soundCar", "sound/car.mp3")
    .add("soundChoque", "sound/choque.wav");

loader.load(jugador);

//capturamos errores
loader.onError.add((e, d)=>{
    //nos dice tanto porcentaje como error de carga
    console.log(e, d);
});
loader.onLoad.add((e, p)=>{
    console.log(p.progressChunk);
});
loader.onComplete.add((loader, resources)=>{
    console.log("Recursos cargados con exito");
    background     = resources["pista"].texture;
    cars           = resources["cars"].texture;
    nubes          = resources["nubes"].texture;
    coche_animado  = resources["coche_animado"].texture;
    soundFondo     = resources["soundFondo"].sound;
    //Bajamos el volumen del sonido, loopeamos y damos play en inicio
    soundFondo.volume = 0.05;
    soundFondo.loop = 1;
    soundFondo.play();
    soundCar    = resources["soundCar"].sound;
    soundCar.loop = 1;
    soundCar.speed = 0.5;
    soundCar.volume= 0.1;
    soundChoque = resources["soundChoque"].sound;
    soundChoque.volume = 0.1;
});

//inicializa el juego , se llama al pulsar el boton play del menú.
function init(){
    //reseteamos variables
    soundFondo.pause();
    enemigos = []; 
    nubecitas = [];
    velocidadNubes = 10;
    velocidaEstandarEnemigo = 10;
    velocidadEnemigo = 10;
    velocidadPrincipal = 5
    consecutivoNubes = 0;
    consecutivoEnemigos = 0;
    totalCochesAdelantados = 0;
    velocidadTileFondo = 15;
    velocidadTileFondoEstandar = 15;
    nivel = 1;
    puntos = 0;
    //Reset de la cuenta del timer
    stopCount();
    stopCountCooldown();
    cuenta = 0;
    cuentaCooldown = 0;

    game = new PIXI.Application({width: width, height: heightWindow});
    game.renderer.backgroundColor = 0x061639;
    game.renderer.autoResize = true;
    document.getElementById("juego").appendChild(game.view);
    setup();
}

function setup(delta){

    //Tileamos el fondo
    fondo = util.tilingSprite(background, renderer.width, renderer.height, 0, 0);
    fondo.tileY = 0;
    game.stage.addChild(fondo);

    //guardamos nuestro jugador en principal
    principal = jugador();
    
    //Activa la animacion
    principal.play();

    //añade el jugador
    game.stage.addChild(principal);
    
    

    console.log(game.stage.addChild(principal));

    //gestiona nuestra tecla left
    left.press = () => { 

        principal.vx = -velocidadPrincipal;
        principal.x += principal.vx;
        
        if(principal.x <= margenIzquierdo){
            principal.x = margenIzquierdo;
        }
        
    }   
    left.release = () => {
        principal.vx = 0;
        principal.vy = 0;
    }
    
    //gestiona nuestra tecla right
    right.press = () => { 
        principal.vx = velocidadPrincipal;
        principal.x += principal.vx;
        
        if(principal.x  > margenDerecho){
            principal.x = margenDerecho;
        }
    }   
    right.release = () => {
        principal.vx = 0;
        principal.vy = 0;
    }
    
    //gestiona nuestra tecla up
    up.press = () => { 
        //comprobamos si nuestra cuenta es 0 de nuevo para poder utilizar la habilidad otra vez
        if(cuentaCooldown == 0){
            //Cuando presiono aumento la velocidad del enemigo a 10 y reduzco el tiempo de spawn /10
            //Empezamos las dos cuentas
            velocidadEnemigo = 1;
            velocidadTileFondo = 5;
            soundCar.speed = 0.1;
            principal.animationSpeed = 0.20;
            startCount();
            startCountCooldown();
        }
        
    }   
    up.release = () => {

    }

    state = play;

    //Sonido del coche
    soundCar.play();

    //llamada a gameLoop
    game.ticker.add(delta => gameLoop(delta))
}

//Bucle principal del juego
function gameLoop(delta){
    //console.log("Cuenta 3 segundos: "+cuenta);
    //console.log("Cooldown 10 segundos"+cuentaCooldown);

    game.stage.addChild(bots());
    
    game.stage.addChild(nubascos());

    for (let q = 1; q < nubecitas.length; q++) {
        
        nubecitas[q].vx = nubecitas[q].vx + velocidadNubes; 
        nubecitas[q].x = nubecitas[q].vx; 
        
        //nubecitas[q].vy = nubecitas[q].vy + velocidadNubes; 
        //nubecitas[q].y = nubecitas[q].vy; 
        
    }
    
    //Hace que los enemigos vayan bajando
    for (let i = 1; i < enemigos.length; i++) {
        enemigos[i].vy = enemigos[i].vy + velocidadEnemigo; 
        enemigos[i].y = enemigos[i].vy; 
       
        
        if(enemigos[i].y > heightWindow && !enemigos[i].paso){
            
            enemigos[i].paso = true;
            totalCochesAdelantados++;
            //Sistema de subida de puntos
            puntos += 5;
            document.querySelector(".puntos").innerHTML = puntos;
            
            
            //cada vez que adelantamos 5 coches sube en 1 la velocidad de los enemigos
            if(totalCochesAdelantados==5){
                
                proximoNivel();
                
            }
        }
            
    }

    //cuando la cuenta es mayor de 3 se colocan las variables en su valor normal
    if(cuenta>3){
        //cuando suelto vuelvo a poner la velocidad a la standard 
        //dejamos la cuenta en 0 y paramos de contar hasta que volvamos a utilizar la habilidad
        velocidadEnemigo = velocidaEstandarEnemigo;
        velocidadTileFondo = velocidadTileFondoEstandar;
        soundCar.speed = 0.5;
        principal.animationSpeed = 0.45;
        stopCount();
        cuenta = 0;
        
    }

    //cuando la cuenta del cooldown alcanza el tiempo fijado la ponemos a 0 y paramos de contar
    if(cuentaCooldown>10){
        stopCountCooldown();
        cuentaCooldown = 0;
    }

    //Control de la velocidad a la que se mueve el fondo
    fondo.tileY += velocidadTileFondo;

    //Llamamos a state para reconocer las colisiones
    state(delta);
}

function play(delta){
    
    //Impide que el player se salga de los margenes dados
    if (principal.x >= margenIzquierdo && principal.x <= margenDerecho){
        principal.x += principal.vx;
    }
    
    //Comprueba las colisiones entre los enemigos y el jugador
    for (let i = 1; i < enemigos.length; i++){
        if(hitTestRectangle(enemigos[i], principal)){
            soundChoque.play();
            gameOver();
        }
        else{

        }
    }
}

//cuando se pulsa el boton inicia el juego
function iniciarJuego(){
    
    //reset del nivel y puntos cuando se inicia una partida nueva
    document.querySelector(".puntos").innerHTML = 0;
    document.querySelector(".nivel").innerHTML = 1;
    
    document.querySelector(".pantalla").classList.add("active");
    init();
}

//se llama cuando chocamos con otro coche
function gameOver(){
    
    soundCar.stop();
    
    game.stop();
    document.querySelector(".pantalla").classList.remove("active");
    document.querySelector(".pantalla h1").innerHTML = "Intentalo de nuevo";

    setTimeout(() => {
        
        document.querySelector("canvas").remove();
        //Cuando perdemos y volvemos al menú activamos el sonido de nuevo.
        soundFondo.play();

    }, 1000);
}

//cada vez que adelantamos x coches se llama
function proximoNivel(){
    
    totalCochesAdelantados=0;
    nivel++;            
    document.querySelector(".nivel").innerHTML = nivel;
    //aumenta en 0.5 la velocidad de los coches enemigos
    velocidaEstandarEnemigo += 0.5;
    velocidadEnemigo = velocidaEstandarEnemigo;
    velocidadTileFondoEstandar += 0.5;
    velocidadTileFondo = velocidadTileFondoEstandar;

    
}
//Gestion de tiempo de duracion de la relentización
function timedCount() {
    cuenta = cuenta + 1;
    t = setTimeout(timedCount, 1000);
}
  
function startCount() {
    if (!timer_is_on) {
        timer_is_on = true;
        timedCount();
    }
}

function stopCount() {
    clearTimeout(t);
    timer_is_on = false;
}

//Gestion de tiempo cooldown
function timedCountCooldown() {
    cuentaCooldown = cuentaCooldown + 1;
    tCooldown = setTimeout(timedCountCooldown, 1000);
}
  
function startCountCooldown() {
    if (!timer_is_on_cooldown) {
        timer_is_on_cooldown = true;
        timedCountCooldown();
    }
}

function stopCountCooldown() {
    clearTimeout(tCooldown);
    timer_is_on_cooldown = false;
}