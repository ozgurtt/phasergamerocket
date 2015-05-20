BasicGame.Game = function (game) {};

//Graphical Object
var ship;

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
	},

	update: function () {
		//execute 'createUfo','createLife','moveShip','collisionDetection' function
		
	}

};