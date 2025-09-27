/*  WORKING N-BODY SIMULATOR, NOT WITH ANY RECOGNISABLE UNITS JUST ARBITRARY VALUES
    ALLOWS YOU TO DRAG AND DROP BODIES, EDIT VELOCITY, MASS, NAME.
    CANNOT SAVE CONFIGURATIONS
*/

let bodies = [];
let playing = false;
let startPos = 75;
let movingBody;
let movingPos;
let selectedBody;
let previousBody;
let massInput = document.getElementById('massInputDiv');
let nameInput = document.getElementById('nameInputDiv');
let menuTitle = document.getElementById('menuTitle');
let velocityInput = document.getElementById('velocityInputDiv');

function setup() {
    // creates a canvas and then appends it to the div with the id "canvasContainer"
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("canvasContainer");
    bodies.push(new Body(50, startPos, height-startPos, 0));
    menu = createDiv('');
}

function draw() {

    if (playing) {
        // draw a rectangle to clear the background, but with opacity to create a trail effect
        fill(0, 20);
        rect(0, 0, width, height);
        // calculate the force of attraction between each pair of bodies
        for (var i = 0; i < bodies.length; i++) {
            for (var j = 0; j < bodies.length; j++) {
                if (i != j) {
                    let force = bodies[j].attract(bodies[i]);
                    bodies[i].applyForce(force);
                }
            }
        }
        // update and show each body
        for (var i = 0; i < bodies.length; i++) {
            bodies[i].update();
            bodies[i].show();
        }
    } else {
        if (movingBody) {
            movingBody.position.x = mouseX+movingPos.x;
            movingBody.position.y = mouseY+movingPos.y;
        }
        if (bodies[bodies.length-1].position.x != startPos || bodies[bodies.length-1].position.y != height-startPos) {
            bodies.push(new Body(50, startPos, height-startPos, bodies.length+1));
        } else {
            fill(0);
            rect(0, 0, width, height);
            fill(200)
            rect(0, height-150, width, 150);
            // update and show each body
            for (var i = 0; i < bodies.length; i++) {
                // check the body is within the right zone, removes it if not
                if (!movingBody && bodies[i].position.y > height-150 && bodies.length-1!=i) {
                    bodies.splice(i,1);
                    selectedBody = null;
                }
                bodies[i].index = i;
                bodies[i].show();
            }
        }
    }

    drawMenu()
}

function drawMenu() {

    if (massInput && nameInput && menuTitle) {
                

        if (selectedBody && !(playing)){

            // if the selected body is changed, change the values of the inputs before setting them to the ones of the previous planet
            if (selectedBody != previousBody) {
                previousBody = selectedBody;
                document.getElementById('massInput').value = selectedBody.mass;
                document.getElementById('nameInput').value = selectedBody.name;
                document.getElementById('velocityAngleInput').value = selectedBody.velocityAngle;
                document.getElementById('velocityMagnitudeInput').value = selectedBody.velocityMagnitude;

            }

		    // displays all the menu items
            massInput.style.visibility = 'visible';
            nameInput.style.visibility = 'visible';
            menuTitle.style.visibility = 'visible';
            velocityInput.style.visibility = 'visible';

            // sets the title of the menu to the body's name
            menuTitle.innerHTML = `${selectedBody.name}`


            if (document.getElementById('velocityMagnitudeInput').value != 0) {
                //set styling of elements now velocity magnitude is greater than 0
                document.getElementById('velocityAngleInput').disabled = false;
                document.getElementById('velocityMagnitude').style.color = 'black';
                document.getElementById('arrow').setAttribute('fill', 'black')

            } else {
                document.getElementById('velocityAngleInput').disabled = true;
                document.getElementById('velocityMagnitude').style.color = 'gray';
                document.getElementById('arrow').setAttribute('fill', 'gray')

            }

            //set attributes of the body accoring to user inputs
            selectedBody.velocityAngle = document.getElementById('velocityAngleInput').value
            selectedBody.velocityMagnitude = document.getElementById('velocityMagnitudeInput').value
            selectedBody.setVelocity()

            // sets each input to have a placeholder value which is the current value of each attribute
            if (document.getElementById('massInput') != document.activeElement && document.getElementById('massButton') != document.activeElement) {
                document.getElementById('massInput').value = selectedBody.mass
            }
            if (document.getElementById('nameInput') != document.activeElement && document.getElementById('nameButton') != document.activeElement) {
                document.getElementById('nameInput').value = selectedBody.name
            }
            document.getElementById('velocityAngleInput').value = selectedBody.velocityAngle
            document.getElementById('velocityMagnitudeInput').value = selectedBody.velocityMagnitude


            //sets the velocity of the body to an angle depending on how far along the slider is
            document.getElementById('velocityMagnitude').innerHTML = selectedBody.velocityMagnitude
            document.getElementById('arrow').style.transform = `rotate(${2*PI*(selectedBody.velocityAngle/100)}rad)`

        } else {
		    // hides the menu if a planet is not selected
            massInput.style.visibility = 'hidden';
            nameInput.style.visibility = 'hidden';
            menuTitle.style.visibility = 'hidden';
            velocityInput.style.visibility = 'hidden';
        }

    } else {
        console.warn('One or more elements not found');
    }

    if (playing) {
        document.getElementById('playBtn').style.visibility = 'hidden';
    }

}

function playButton() {
    playing = true;
    selectedBody = null;
    bodies.splice(bodies.length-1,1);
    document.getElementById('playRow').visibility = 'hidden';
}

// handling a click, dependent on position of mouse
function mousePressed() {
    finished = false
    if (!playing) {
        for (i=0; i < bodies.length; i++) {
            if (withinObject(mouseX,mouseY,bodies[i].position.x,bodies[i].position.y,bodies[i].radius) && !(movingBody)) {
                selectedBody = bodies[i];
                movingBody = bodies[i];
                movingPos = createVector(bodies[i].position.x-mouseX,bodies[i].position.y-mouseY)
                finished = true
            }
        }        
    }

    if (mouseY > height-150) {
        finished = true
    }
    if (!finished) {
        selectedBody = null
    }
}

function mouseReleased() {
    movingBody = null;
}

// takes an x,y co-ordinate (x1,y1) and sees if it is within a circle of centre (x2,y2) and radius r
function withinObject(x1,y1,x2,y2,r) {
    return(((x1-x2)**2+(y1-y2)**2)<r**2)
}

function setMass() {
    selectedBody.mass = int(document.getElementById('massInput').value)
    if (document.getElementById('massInput').value>300) {
        selectedBody.radius = int(300)
    } else {
        selectedBody.radius = int(document.getElementById('massInput').value)
    }
}

function changeName() {
    selectedBody.name = document.getElementById('nameInput').value
}

class Body {
    constructor(mass, x, y, index) {
        this.index = index;
        this.name = `Body ${index}`;
        this.mass = mass;
        this.radius = this.mass
        this.position = createVector(x, y);
        this.velocityAngle = 0;
        this.velocityMagnitude = 0;
        this.velocity = createVector(0, 0);
        this.acceleration = createVector(0, 0);
    }

    // returns the force of attraction between this body and the given body
    attract(planet) {
        let force = p5.Vector.sub(this.position, planet.position);
        let distance = force.mag()
        let minDistance = this.radius + planet.radius;
        distance = max(distance, minDistance);
        let strength = (50 * this.mass * planet.mass) / (distance * distance);
        force.setMag(strength);
        return force;        
    }

    // updates the body's position based on its velocity and acceleration
    update() {
        this.velocity.add(this.acceleration);
        this.position.add(this.velocity);
        this.acceleration.mult(0);
    }

    // sets an objects velocity based on angle and magnitude
    setVelocity() {
        let angle = 2*PI*(this.velocityAngle/100)
        this.velocity.x = this.velocityMagnitude*cos(angle)*0.2
        this.velocity.y = this.velocityMagnitude*sin(angle)*0.2
    }

    // applies a force to the body, e.g. gravity
    applyForce(force) {
        let f = force.copy();
        f.div(this.mass);
        this.acceleration.add(f);
    }

    // draws the body on the canvas
    show() {
        if (selectedBody == this) {
            fill(255);
            circle(this.position.x, this.position.y, int(this.radius)+int(3));
        }
        fill(255*this.index/10,125,255);
        circle(this.position.x, this.position.y, this.radius);


    }
}

// adding event listeners

document.getElementById('massInput').addEventListener('focus', function () {
    this.value = "";
});

document.getElementById('nameInput').addEventListener('focus', function () {
    this.value = "";
});

setup()
draw()
