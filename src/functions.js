function jugador(){
    
  var anchoPersonaje = 55;
  var altoPersonaje = 120;
  //centra el pj en el canvas
  var posx = (renderer.width/2)-(anchoPersonaje/2);
  var posy = (renderer.height-altoPersonaje) - 5;

  const texturas =[];

  //Cargamos el array de texturas basado en el json
  for(let i = 0; i<6; i++){
    texturas.push(PIXI.Texture.from(`${i}.png`));
  }

  const animacion = new PIXI.extras.AnimatedSprite(texturas);

  animacion.x = posx;
  animacion.y = posy;

  animacion.vx = 0;
  animacion.vy = 0;

  animacion.animationSpeed = 0.45;
  
  return animacion;
}

function bots(){
  consecutivoEnemigos++;
  var anchoPersonaje = 55;
  var altoPersonaje = 120;

  //vector con las posiciones de todos los coches
  var posiciones = [
    //X1
    [0, 0], [56, 0], [111, 0], [166, 0], [225, 0],
    //X2
    [0, 121], [56, 121], [111, 121], [171, 121], [227, 121]
    
  ];

  var posvy = 0;

  if(consecutivoEnemigos > 1){
    var ultimoEnemigo = enemigos[consecutivoEnemigos-1];
    //Salgan coches dejando el espacio del altoPersonaje * 3
    posvy = ultimoEnemigo.y - altoPersonaje*3;
  }

  var anchopista = renderer.width - (laterales * 2);

  //Posicion aleatoria en X de los enemigos.
  var posx = randomInt(0,anchopista - anchoPersonaje); 
      posx +=laterales;

  //sacamos un rand y lo guardamos en posicion
  var rand = randomInt(0, 10);
  var posicion = posiciones[rand];

  let texture = util.frame(cars, posicion[0], posicion[1], anchoPersonaje, altoPersonaje);
  enemigos[consecutivoEnemigos] = util.sprite(texture);
  enemigos[consecutivoEnemigos].x = posx;     
  enemigos[consecutivoEnemigos].vy = posvy;   

  return enemigos[consecutivoEnemigos];   

}

function nubascos(){
  consecutivoNubes++;
  var anchoPersonaje = 150;
  var altoPersonaje = 90;

  //Posicion aleatoria en Y de las nubes
  var posy = randomInt(0,1080 - anchoPersonaje); 
  var posx = 0;
  

  var posvx = 0;
  var posvy = 0;

  if(consecutivoNubes > 1){
    var ultimaNube = nubecitas[consecutivoNubes-1];
    posvx = ultimaNube.x - altoPersonaje*4;
  }

  let texture = util.frame(nubes, 0, 0, anchoPersonaje, altoPersonaje);
  nubecitas[consecutivoNubes] = util.sprite(texture);
  
  //Posicion inicial de las nuebes
  nubecitas[consecutivoNubes].x = posx;
  nubecitas[consecutivoNubes].y = posy;

  //Velocidad de las nuebes
  nubecitas[consecutivoNubes].vx = posvx;
  nubecitas[consecutivoNubes].vy = posvy;

  nubecitas[consecutivoNubes].alpha = 0.5;

  //Random para que las nubes puedan ser de dos tamaños distintos cambiandoles la scala y les damos una rotacion

  var tamRand = randomFloat(0.5,2);

  nubecitas[consecutivoEnemigos].transform.scale.x = tamRand;
  nubecitas[consecutivoEnemigos].transform.scale.y = tamRand;

  var tamRot = randomFloat(0.01,1);

  nubecitas[consecutivoEnemigos].transform.rotation = tamRot;


  //console.log(nubecitas[consecutivoEnemigos].transform.rotation);
  //console.log(tamRot);

  return nubecitas[consecutivoNubes];
}

//Devuelve un numero aleatorio dentro del rango pasado como parametros
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function randomFloat(min, max) {
  return (Math.random() * (max - min)) + min;
}

//Funcion que nos da Pixi para reconocer colisiones entre rectangulos
function hitTestRectangle(r1, r2) { 
    //Define the variables we'll need to calculate
    let hit, combinedHalfWidths, combinedHalfHeights, vx, vy; 
    //hit will determine whether there's a collision
    hit = false; 
    //Find the center points of each sprite
    r1.centerX = r1.x + r1.width / 2;
    r1.centerY = r1.y + r1.height / 2;
    r2.centerX = r2.x + r2.width / 2;
    r2.centerY = r2.y + r2.height / 2; 
    //Find the half-widths and half-heights of each sprite
    r1.halfWidth = r1.width / 2;
    r1.halfHeight = r1.height / 2;
    r2.halfWidth = r2.width / 2;
    r2.halfHeight = r2.height / 2; 
    //Calculate the distance vector between the sprites
    vx = r1.centerX - r2.centerX;
    vy = r1.centerY - r2.centerY; 
    //Figure out the combined half-widths and half-heights
    combinedHalfWidths = r1.halfWidth + r2.halfWidth;
    combinedHalfHeights = r1.halfHeight + r2.halfHeight; 
    //Check for a collision on the x axis
    if (Math.abs(vx) < combinedHalfWidths) { 
      //A collision might be occurring. Check for a collision on the y axis
      if (Math.abs(vy) < combinedHalfHeights) { 
        //There's definitely a collision happening
        hit = true;
      } else {
  
        //There's no collision on the y axis
        hit = false;
      }
    } else {
  
      //There's no collision on the x axis
      hit = false;
    }
  
    //`hit` will be either `true` or `false`
    return hit;
};
