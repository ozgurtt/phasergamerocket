BasicGame.Game = function (game) {};

//Graphical Object
var ship;
var ufos; //Group of Enemy UFOs which drop from the top of the screen 
var lives; //Group of Lives which are collected

var bullets; //Bullets which your spaceship fires
var fireRate = 100; // Rate at which bullets are fired
var nextFire = 0;

//Score & Life Objects
var score; //Players Score
var lifeTotal; //Players total number of lives
var scoreText; //Text which is used to display the score
var lifeTotalText; //Text which is used to display the number of lives

//Audio Variables stores the audio in the game 
var music;
var bulletAudio;
var explosionAudio;

//Timer Variables stores information about the timer 
var seconds; //Number of seconds game has been running
var timer;
var timerText;

//Misc Variables
var cursors; //Keyboard control 
var gameOverText; //Game Over message
var restartButton; //Restart game button
var gameOver;

BasicGame.Game.prototype = {

	create: function () {
        //Specifying the physics game engine to ARCADE 
		this.physics.startSystem(Phaser.Physics.ARCADE);
		//Adding the starfield, logo onto the screen
		this.starfield = this.add.tileSprite(0, 0, 800, 600, 'starfield');
		//Adding the ship onto the screen, set the physics and the boundarys
		ship = this.add.sprite((this.world.width / 2), this.world.height - 50, 'ship');
		ship.anchor.setTo(0.5,0);
		this.physics.enable(ship, Phaser.Physics.ARCADE);
		ship.body.collideWorldBounds = true;

		//Creating Groups
		//Create the ufos group, set the physics and the boundarys
		ufos = this.add.group();
		this.physics.enable(ufos, Phaser.Physics.ARCADE);
		
		ufos.setAll('outOfBoundsKill', true);
		ufos.setAll('checkWorldBounds', true);
        ufos.setAll('anchor.x', 0.5);
		ufos.setAll('anchor.y', 0.5);
		
		//Create the lives group, set the physics and the boundarys
		lives = this.add.group();
		this.physics.enable(lives, Phaser.Physics.ARCADE);
		
		lives.setAll('outOfBoundsKill', true);
		lives.setAll('checkWorldBounds', true);
        lives.setAll('anchor.x', 0.5);
		lives.setAll('anchor.y', 0.5);
        
		//Create the bullets group, set the physics, multiples and boundarys
		bullets = this.add.group();
		bullets.enableBody = true;
		bullets.physicsBodyType = Phaser.Physics.ARCADE;
		bullets.createMultiple(30, 'bullet', 0, false);
		bullets.setAll('anchor.x', 0.5);
		bullets.setAll('anchor.y', 0.5);
		bullets.setAll('outOfBoundsKill', true);
		bullets.setAll('checkWorldBounds', true);

		//Setting up and adding the Score, Life and Timer to the Screen
		scoreText = this.add.text(16, 16, 'Score: 0', {
			font: '32px arial',
			fill: '#fff'
		});
		//sets the score to 0 and output to the screen
		score = 0;
		scoreText.text = "Score: " + score;
		
		lifeTotalText = this.add.text(this.world.width - 150, 16, 'Lives: 3', {
			font: '32px arial',
			fill: '#fff'
		});
		//sets the lifeTotal to 3 and output to the screen
		lifeTotal = 3;
		lifeTotalText.text = 'Lives: ' + lifeTotal;
		
		timerText = this.add.text(350, 16, 'Time: 0', {
			font: '32px arial', 
			fill: '#fff'
		});
		//setup timer
		timer = this.time.create(false);
		seconds = 0;
		timerText.text = 'Time: ' + seconds;
		
		gameOverText = this.add.text(this.world.centerX, this.world.centerY-50, 'Game Over', {
			font: '96px arial',
			fill: '#fff',
			align: 'center'
		});
		gameOverText.anchor.set(0.5);
        //hides the gameState text
		gameOverText.visible = false;
		gameOver = false;
		
		//Create a restart button and hide on screen 
		restartButton = this.add.button((this.world.width / 2), (this.world.height / 2)+50, 'startButton', this.restartGame);
		restartButton.anchor.set(0.5);
		restartButton.visible = false;
		
		//Setting the keyboard to accept LEFT, RIGHT and SPACE input
		this.input.keyboard.addKeyCapture([Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT, Phaser.Keyboard.SPACEBAR]);
		cursors = this.input.keyboard.createCursorKeys();

		//Load the audio into memory, starting music
        bulletAudio = this.add.audio('bullet');
		explosionAudio = this.add.audio('explosion');
		music = this.add.audio('music', 1, true);
		music.play('', 0, 1, true);
		
		//Set a TimerEvent to occur every second and start the timer
		timer.loop(1000, this.updateTimer, this);
		timer.start();
	},

	update: function () {
		//Scroll the background
		this.starfield.tilePosition.y += 2;
		//if lifeTotal is less than 1 or seconds = 60 or gameOver variable = true then execute 'truegameOver' function
		if (lifeTotal < 1 || seconds == 60 || gameOver===true) {
			this.gameOver();
		}
		//else execute 'createUfo','createLife','moveShip','collisionDetection' function
		else {
			this.createUfo();
			this.createLife();
			this.moveShip();
			this.collisionDetection();
		}
	},

	//moves ship and fires bullet from keyboard controls
	moveShip: function () {
		//if left arrow key pressed move players ship left
		if (cursors.left.isDown) {
			//  Move to the left
			ship.body.velocity.x = -200;
		}
		//if right arrow key pressed move players ship right
		else if (cursors.right.isDown) {
		    ship.body.velocity.x = 200;
		}
		//else stop ship
		else {
		    ship.body.velocity.x = 0;
		}
		//if space bar is pressed execute the 'fireBullet' function
		if (this.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
			this.fireBullet();
		}
	},

	//function executed during playing the game to create a UFO
	createUfo: function () {
		//Generate random number between 0 and 20 
		var random = this.rnd.integerInRange(0, 20);
		//if random number equals 0 then create a ufo in a random x position and random y velocity 
		if (random === 0) {
            //Generating random position in the X Axis
			var randomX = this.rnd.integerInRange(0, this.world.width - 150);
			//Creating a ufo from the the ufos group and setting physics 
			var ufo = ufos.create(randomX, -50, 'ufo');
			this.physics.enable(ufo, Phaser.Physics.ARCADE);
			//Generating a random velocity
			ufo.body.velocity.y = this.rnd.integerInRange(200, 300);
		}
	},

	//function executed during playing the game to create a Life
	createLife: function () {
		//Generate random number between 0 and 500 
		var random = this.rnd.integerInRange(0, 500);
		//if random number equals 0 then create a life in a random x position
		if (random === 0) {
            //Generating random position in the X Axis
			var randomX = this.rnd.integerInRange(0, this.world.width - 150);
            //Creating a ufo from the the ufos group and setting physics 
			var life = lives.create(randomX, -50, 'life');
			this.physics.enable(life, Phaser.Physics.ARCADE);
			//Generating a random velocity
			life.body.velocity.y = 150;
		}
	},

	//Generate bullet and position in the x axis, set the velocity and play the audio
	fireBullet: function () {
		if (this.time.now > nextFire && bullets.countDead() > 0) {
			nextFire = this.time.now + fireRate;
			var bullet = bullets.getFirstExists(false);
			bullet.reset(ship.x, ship.y);
			bullet.body.velocity.y = -400;
			bulletAudio.play();
		}
	},

	//function executed during playing the game to check for collisions
	collisionDetection: function () {
		this.physics.arcade.overlap(ship, ufos, this.collideUfo, null, this);
		this.physics.arcade.overlap(ship, lives, this.collectLife, null, this);
		this.physics.arcade.overlap(bullets, ufos, this.destroyUfo, null, this);
	},

	//function executed if there is collision between player and ufo. UFO is destroyed, animation & sound, reduce lifeTotal
	collideUfo: function (ship,ufo) {
		explosionAudio.play();
		ufo.kill();
		var animation = this.add.sprite(ufo.body.x, ufo.body.y, 'kaboom');
		animation.animations.add('explode');
		animation.animations.play('explode', 30, false, true);
		lifeTotal--;
		lifeTotalText.text = 'Lives: ' + lifeTotal;
		//
		gameOver=true;
	},

	//function executed if there is collision between ufo and bullet. UFO is destroyed, animation & sound, increase score
	destroyUfo: function (bullet, ufo) {
		explosionAudio.play();
		ufo.kill();
		bullet.kill();
		var animation = this.add.sprite(ufo.body.x, ufo.body.y, 'kaboom');
		animation.animations.add('explode');
		animation.animations.play('explode', 30, false, true);
		score += 100;
		scoreText.text = 'Score: ' + score;
	},

	//function executed if there is collision between player and life. Life is destroyed, animation & sound, increase lifeTotal
	collectLife: function (ship, life) {
		life.kill();
		lifeTotal++;
		lifeTotalText.text = 'Lives: ' + lifeTotal;
		var animation = this.add.sprite(life.body.x, life.body.y, 'lifeAnimation');
		animation.animations.add('lifeAnimation');
		animation.animations.play('lifeAnimation', 30, false, true);
	},

	//Updates timer and outputs to the screen
	updateTimer: function () {
		seconds++;
		timerText.text = 'Time: ' + seconds;
	},

	//function is executed when the game ends. Stops Ship, Kills all objects, stops timer, Display Restart Button
	gameOver: function () {
		ship.body.velocity.x = 0;
		ship.body.x = (this.world.width/2)-(ship.body.width/2);
		ufos.callAll('kill');
		lives.callAll('kill');
		bullets.callAll('kill');
		music.stop();
		gameOverText.visible = true;
		restartButton.visible = true;
		timer.stop();
	},
    
    //Restart function, executed when restart button is pressed
	restartGame: function () {
		this.game.state.start('Game');
	},
	
	//render: function() {
        // Sprite debug info
        //this.game.debug.bodyInfo(ship, 32, 100);
        //this.game.debug.spriteBounds(ship);
    //}
	
};
