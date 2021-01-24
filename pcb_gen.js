var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

const trace_colour = "#23a120"
const colour_background = "#096607"
const colour_pins = "#A0A0A0"
const colour_chips = "#000000"
const colour_text = "#909090"

class Tile {
   constructor(pos_x, pos_y, size_x, size_y){
      this.pos_x = pos_x
      this.pos_y = pos_y
      this.size_x = size_x
      this.size_y = size_y
      this.color = colour_background
   }

   draw(){
      ctx.fillStyle = this.color
      ctx.fillRect(this.pos_x, this.pos_y, this.size_x, this.size_y);
   }
}

class Hole {
   constructor(pos_x, pos_y, size_x, size_y, grid_pos_x, grid_pos_y){
      this.pos_x = pos_x //pos as px
      this.pos_y = pos_y
      this.size_x = size_x //size of the hole
      this.size_y = size_y
      this.grid_pos_x = grid_pos_x // position on the grid
      this.grid_pos_y = grid_pos_y
   }

   //to search for a path, remove the ocupation in the center and borders of the hole
   remove_occupation(grid_occup){
      grid_occup[this.grid_pos_x-1][this.grid_pos_y] = 0
      grid_occup[this.grid_pos_x][this.grid_pos_y-1] = 0
      grid_occup[this.grid_pos_x][this.grid_pos_y] = 0
      grid_occup[this.grid_pos_x+1][this.grid_pos_y] = 0
      grid_occup[this.grid_pos_x][this.grid_pos_y+1] = 0
   }

   //once a path is found, place back the occupation to avoid having a connection going through
   add_occupation(grid_occup){
      grid_occup[this.grid_pos_x-1][this.grid_pos_y] = 1
      grid_occup[this.grid_pos_x][this.grid_pos_y-1] = 1
      grid_occup[this.grid_pos_x][this.grid_pos_y] = 1
      grid_occup[this.grid_pos_x+1][this.grid_pos_y] = 1
      grid_occup[this.grid_pos_x][this.grid_pos_y+1] = 1
   }

   get_parent(){
      return 0
   }

   draw(){
      //draw the copper border of the hole
      ctx.fillStyle = "#909000"
      ctx.beginPath();
      ctx.arc(this.pos_x+0.5*this.size_x, this.pos_y+0.5*this.size_y, this.size_x*0.3, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = "#000000"
      ctx.beginPath();
      ctx.arc(this.pos_x+0.5*this.size_x, this.pos_y+0.5*this.size_y, this.size_x*0.2, 0, 2 * Math.PI);
      ctx.fill();
   }
}

//represents a pin of a larger chip, thus the parent of the pin
class Pin{
   constructor(size_x, size_y, grid_pos_x, grid_pos_y, parent){
      this.size_x = size_x
      this.size_y = size_y
      this.grid_pos_x = grid_pos_x
      this.grid_pos_y = grid_pos_y
      this.parent = parent
   }

   get_parent(){
      return this.parent
   }

   remove_occupation(grid_occup){
      grid_occup[this.grid_pos_x][this.grid_pos_y] = 0
   }

   add_occupation(grid_occup){
      grid_occup[this.grid_pos_x][this.grid_pos_y] = 1
   }
}

//will represent element such as resistor
class Two_pins_element{
   constructor(pos_x, pos_y, size_x, size_y, grid_pos_x, grid_pos_y, is_rotated, element){
      this.pos_x = pos_x
      this.pos_y = pos_y
      this.size_x = size_x
      this.size_y = size_y
      this.grid_pos_x = grid_pos_x
      this.grid_pos_y = grid_pos_y
      this.is_rotated = is_rotated
      this.element = element

      //label on the component will only be a 3digit number
      this.label = Math.floor(Math.random()*800+100).toString();

      if(is_rotated){
         this.pin1 = new Pin(size_x, size_y, grid_pos_x, grid_pos_y-3, this)
         this.pin2 = new Pin(size_x, size_y, grid_pos_x, grid_pos_y+3, this)
      }
      else{
         this.pin1 = new Pin(size_x, size_y, grid_pos_x-3, grid_pos_y, this)
         this.pin2 = new Pin(size_x, size_y, grid_pos_x+3, grid_pos_y, this)
      }

   }

   get_pins(){
      return {pin1:this.pin1, pin2:this.pin2}
   }

   draw(){
      ctx.fillStyle = colour_chips

      //to draw a rotated component, need to rotate the ctx PI/2, draw, then rotate by -PI/2
      if(this.is_rotated){
         for (var i = this.grid_pos_x-1; i <= this.grid_pos_x+1; i++) {
            for (var j = this.grid_pos_y-2; j <= this.grid_pos_y+2; j++) {
               ctx.fillRect(i*this.size_x, j*this.size_y, this.size_x, this.size_y);
            }
         }
         ctx.translate((this.grid_pos_x+0.5)*this.size_x, (this.grid_pos_y+0.5)*this.size_y);
         ctx.rotate(Math.PI*2.0/4.0);
         ctx.fillStyle = colour_text
         ctx.font = "8.5px Arial";
         ctx.textAlign = "center";
         ctx.fillText(this.label, 0, 0 );
         ctx.rotate(-Math.PI*2.0/4.0);
         ctx.translate(-(this.grid_pos_x+0.5)*this.size_x, -(this.grid_pos_y+0.5)*this.size_y);
      }
      else{
         for (var i = this.grid_pos_x-2; i <= this.grid_pos_x+2; i++) {
            for (var j = this.grid_pos_y-1; j <= this.grid_pos_y+1; j++) {
               ctx.fillRect(i*this.size_x, j*this.size_y, this.size_x, this.size_y);
            }
         }
         ctx.fillStyle = colour_text
         ctx.font = "8.5px Arial";
         ctx.translate((this.grid_pos_x+0.5)*this.size_x, (this.grid_pos_y+0.7)*this.size_y);
         ctx.textAlign = "center";
         ctx.fillText(this.label, 0, 0 );
         ctx.translate(-(this.grid_pos_x+0.5)*this.size_x, -(this.grid_pos_y+0.7)*this.size_y);
      }


      ctx.fillStyle = colour_pins
      if(this.is_rotated){
         ctx.fillRect( (this.grid_pos_x)*this.size_x, (this.grid_pos_y-3)*this.size_y, this.size_x, this.size_y);
         ctx.fillRect( (this.grid_pos_x)*this.size_x, (this.grid_pos_y+3)*this.size_y, this.size_x, this.size_y);
      }
      else{
         ctx.fillRect( (this.grid_pos_x-3)*this.size_x, this.grid_pos_y*this.size_y, this.size_x, this.size_y);
         ctx.fillRect( (this.grid_pos_x+3)*this.size_x, this.grid_pos_y*this.size_y, this.size_x, this.size_y);
      }

   }
}

//represents a chip with the pins on the side
class Square_element{
   constructor(pos_x, pos_y, size_x, size_y, grid_pos_x, grid_pos_y, nb_pins){
      this.pos_x = pos_x
      this.pos_y = pos_y
      this.size_x = size_x
      this.size_y = size_y
      this.grid_pos_x = grid_pos_x
      this.grid_pos_y = grid_pos_y
      this.nb_pins = nb_pins //need to be odd
      this.pins = []
      this.label = []
      this.rotation = Math.floor(Math.random()*4);

      for (var i = this.grid_pos_x-this.nb_pins+1; i <= this.grid_pos_x+this.nb_pins-1; i+=2) {
         this.pins.push(new Pin(size_x, size_y, i, this.grid_pos_y-this.nb_pins-1, this))
         this.pins.push(new Pin(size_x, size_y, i, this.grid_pos_y+this.nb_pins+1, this))
      }

      for (var j = this.grid_pos_y-this.nb_pins+1; j <= this.grid_pos_y+this.nb_pins-1; j+=2) {
         this.pins.push(new Pin(size_x, size_y, this.grid_pos_x-this.nb_pins-1, j, this))
         this.pins.push(new Pin(size_x, size_y, this.grid_pos_x+this.nb_pins+1, j, this))
      }

      //make the label longer if there are more pins (more area)
      this.label[0] = ""+String.fromCharCode(65+Math.random()*26)+String.fromCharCode(65+Math.random()*26)+String.fromCharCode(65+Math.random()*26);
      if(nb_pins == 3){
         this.label[1] = Math.floor(Math.random()*8000+1000).toString();
      }
      if(nb_pins == 5){
         this.label[1] = Math.floor(Math.random()*800000+100000).toString();
      }
      if(nb_pins == 7){
         this.label[1] = Math.floor(Math.random()*800000+100000).toString();
         this.label[2] = Math.floor(Math.random()*800000+100000).toString();
      }
   }

   get_pins(){
      return this.pins
   }

   draw(){
      ctx.fillStyle = colour_chips
      //draw the body of the chip
      for (var i = this.grid_pos_x-this.nb_pins; i <= this.grid_pos_x+this.nb_pins; i++) {
         for (var j = this.grid_pos_y-this.nb_pins; j <= this.grid_pos_y+this.nb_pins; j++) {
            ctx.fillRect(i*this.size_x, j*this.size_y, this.size_x, this.size_y);
         }
      }

      //draw the pins on the sides
      ctx.fillStyle = colour_pins
      for (var i = this.grid_pos_x-this.nb_pins+1; i <= this.grid_pos_x+this.nb_pins-1; i+=2) {
         ctx.fillRect(i*this.size_x, (this.grid_pos_y-this.nb_pins-1)*this.size_y, this.size_x, this.size_y);
         ctx.fillRect(i*this.size_x, (this.grid_pos_y+this.nb_pins+1)*this.size_y, this.size_x, this.size_y);
      }

      for (var j = this.grid_pos_y-this.nb_pins+1; j <= this.grid_pos_y+this.nb_pins-1; j+=2) {
         ctx.fillRect((this.grid_pos_x-this.nb_pins-1)*this.size_x, j*this.size_y, this.size_x, this.size_y);
         ctx.fillRect((this.grid_pos_x+this.nb_pins+1)*this.size_x, j*this.size_y, this.size_x, this.size_y);
      }

      //draw the notch
      ctx.fillStyle = "#404040"
      ctx.beginPath();
      if(this.rotation == 0){
         ctx.arc( (this.grid_pos_x-this.nb_pins+1.0)*this.size_x, (this.grid_pos_y-this.nb_pins+1.0)*this.size_y, (this.size_x/16)*this.nb_pins, 0, 2 * Math.PI);
      }
      if(this.rotation == 1){
         ctx.arc( (this.grid_pos_x+this.nb_pins)*this.size_x, (this.grid_pos_y-this.nb_pins+1.0)*this.size_y, (this.size_x/16)*this.nb_pins, 0, 2 * Math.PI);
      }
      if(this.rotation == 2){
         ctx.arc( (this.grid_pos_x-this.nb_pins+1.0)*this.size_x, (this.grid_pos_y+this.nb_pins)*this.size_y, (this.size_x/16)*this.nb_pins, 0, 2 * Math.PI);
      }
      if(this.rotation == 3){
         ctx.arc( (this.grid_pos_x+this.nb_pins)*this.size_x, (this.grid_pos_y+this.nb_pins)*this.size_y, (this.size_x/16)*this.nb_pins, 0, 2 * Math.PI);
      }
      ctx.fill();

      //draw the label on the chip
      ctx.fillStyle = colour_text
      if(this.nb_pins == 3){
         ctx.font = "7.5px Arial";
      }
      else{
         ctx.font = "9px Arial";
      }
      ctx.textAlign = "center";
      ctx.textBaseline = 'middle';

      //rotation will not be perfect, may be unreadeable, but good enough
      var idx = 0; //idx for each line of the label
      if(this.nb_pins < 7){
         for(var i = -1.5; i <= 1.5; i+=3){
            if(this.rotation == 1 || this.rotation == 3){
               ctx.translate((this.grid_pos_x+0.5+i)*this.size_x, (this.grid_pos_y+0.5)*this.size_y);
            }else{
               ctx.translate((this.grid_pos_x+0.5)*this.size_x, (this.grid_pos_y+0.5+i)*this.size_y);
            }
            //will rotate increments of 90 degrees
            ctx.rotate(Math.PI*2.0*0.25*this.rotation);
            ctx.fillText(this.label[idx], 0, 0 );
            ctx.rotate(-Math.PI*2.0*0.25*this.rotation);
            if(this.rotation == 1 || this.rotation == 3){
               ctx.translate(-(this.grid_pos_x+0.5+i)*this.size_x, -(this.grid_pos_y+0.5)*this.size_y);
            }else{
               ctx.translate(-(this.grid_pos_x+0.5)*this.size_x, -(this.grid_pos_y+0.5+i)*this.size_y);
            }
            idx++;
         }
      }
      else{
         for(var i = -3; i <= 3; i+=3){
            if(this.rotation == 1 || this.rotation == 3){
               ctx.translate((this.grid_pos_x+0.5+i)*this.size_x, (this.grid_pos_y+0.5)*this.size_y);
            }else{
               ctx.translate((this.grid_pos_x+0.5)*this.size_x, (this.grid_pos_y+0.5+i)*this.size_y);
            }
            ctx.rotate(Math.PI*2.0*0.25*this.rotation);
            ctx.fillText(this.label[idx], 0, 0 );
            ctx.rotate(-Math.PI*2.0*0.25*this.rotation);
            if(this.rotation == 1 || this.rotation == 3){
               ctx.translate(-(this.grid_pos_x+0.5+i)*this.size_x, -(this.grid_pos_y+0.5)*this.size_y);
            }else{
               ctx.translate(-(this.grid_pos_x+0.5)*this.size_x, -(this.grid_pos_y+0.5+i)*this.size_y);
            }
            idx++;
         }
      }
   }
}

//end connexion represents any point on which a wire can be connected (hole or pin on a chip)
class End_Connexion {
   constructor(pos_x, pos_y, element){
      this.pos_x = pos_x
      this.pos_y = pos_y
      this.element = element
      this.used = 0;
   }

   draw(){
   }
}

//represents the wire between two end points, and methods to find this connections
class Connexion{
   constructor(pin0, pin1, occup_grid, cell_size_x, cell_size_y){
      this.pin0 = pin0;
      this.pin1 = pin1;
      this.lines = [];
      this.cell_size_x = cell_size_x;
      this.cell_size_y = cell_size_y;
      this.occupation_grid = occup_grid;
   }

   //find nearest pin according to heuristic, that is one with lowest fcost
   find_idx_nearest(list_to_handle){
      var idx_nearest = 0;
      var fcost_nearest = 1000000; //near infinite value
      for(var i = 0; i < list_to_handle.length; i++){
         if(fcost_nearest > list_to_handle[i].fcost){
            idx_nearest = i;
            fcost_nearest = list_to_handle[i].fcost;
         }
      }
      return idx_nearest;
   }

   find_connexion(){
      var visited_nodes = []; //[visited, nextx, nexty, start, end, has_next, cost, posx, posy]
      var list_to_handle = [];
      var startx = this.pin0.element.grid_pos_x;
      var starty = this.pin0.element.grid_pos_y;
      var endx = this.pin1.element.grid_pos_x;
      var endy = this.pin1.element.grid_pos_y;

      //build visited nodes matrix
      for(var i = 0; i < this.occupation_grid.length; i++){
         visited_nodes[i] = Array(this.occupation_grid[i].length);
         visited_nodes[i].fill(0);
      }

      // visited_nodes = this.build_array();
      var startx = this.pin0.element.grid_pos_x;
      var starty = this.pin0.element.grid_pos_y;
      visited_nodes[startx][starty] = {visited: this.occupation_grid[startx][starty], prevx:0, prevy:0, has_prev:0, gcost:0, fcost:100000000, posx:startx, posy:starty}
      list_to_handle.push(visited_nodes[startx][starty]); //this.pin0.element.grid_pos_x == i && this.pin0.element.grid_pos_y

      for(var i = 0; i < 90; i++){

         if(list_to_handle.length == 0){
            return false;
         }

         // list_to_handle.sort(function(a, b){return a.fcost-b.fcost}); //smallest first
         // this.sorting(list_to_handle)

         var idx_nearest_node = this.find_idx_nearest(list_to_handle)

         var cur = list_to_handle[idx_nearest_node];

         if(cur.posx == endx && cur.posy == endy){
            //should never happen
            this.add_wire(cur, visited_nodes, startx, starty, endx, endy);
            return true;
         }
         if(cur.posx == endx && cur.posy == endy+1){
            this.add_wire(cur, visited_nodes, startx, starty, endx, endy);
            // this.pin1.wirefrom = "S";
            return true;
         }
         if(cur.posx == endx && cur.posy == endy-1){
            this.add_wire(cur, visited_nodes, startx, starty, endx, endy);
            // this.pin1.wirefrom = "N";
            return true;
         }
         if(cur.posx == endx+1 && cur.posy == endy){
            this.add_wire(cur, visited_nodes, startx, starty, endx, endy);
            // this.pin1.wirefrom = "E";
            return true;
         }
         if(cur.posx == endx-1 && cur.posy == endy){
            this.add_wire(cur, visited_nodes, startx, starty, endx, endy);
            // this.pin1.wirefrom = "W";
            return true;
         }

         // list_to_handle.shift(); //remove from start
         list_to_handle.splice(idx_nearest_node, 1);

         cur.visited = 1;
         cur.has_prev = 1;

         // this.occupation_grid[cur.posx][cur.posy] = 1

         //define which neighbour is good
         var neigh = this.get_neighbours(cur, visited_nodes);

         for (var u = 0; u < neigh.length; u++) {
            var new_gscore = cur.gcost + 0.6; //if this 1, will take way too much time
            if(!list_to_handle.includes(neigh[u])){
               list_to_handle.push(neigh[u]);
            }
            else if(new_gscore >= neigh[u].gcost){
               continue;
            }
            neigh[u].prevx = cur.posx;
            neigh[u].prevy = cur.posy;
            neigh[u].gcost = new_gscore;
            var heuristic = 0;

            //this heuristic allows a* to get shortest path but is not really what we want in
            //an electronic schematic
            heuristic = Math.sqrt(Math.pow(endx-neigh[u].posx, 2)+Math.pow(endy-neigh[u].posy, 2));

            //manathan distance heuristic, gives straight lines
            // heuristic = Math.abs(endx-neigh[u].posx)+Math.abs(endy-neigh[u].posy);
            neigh[u].fcost = neigh[u].gcost + heuristic; //heuristic
         }

      }
      return false
   }

   //get neighbours of a node
   get_neighbours(node, visited_nodes){
      var size_x = this.occupation_grid.length;
      var size_y = this.occupation_grid[0].length;
      var x = node.posx;
      var y = node.posy;
      var lst_ret = [];

      //create the visited nodes array as we get the neighbours, this prevents creating a massive array at the start
      if(x-1 >= 0 && visited_nodes[x-1][y] == 0){
         visited_nodes[x-1][y] = {visited: this.occupation_grid[x-1][y], prevx:0, prevy:0, has_prev:0, gcost:0, fcost:100000000, posx:x-1, posy:y};
      }
      if(x+1 < size_x && visited_nodes[x+1][y] == 0){
         visited_nodes[x+1][y] = {visited: this.occupation_grid[x+1][y], prevx:0, prevy:0, has_prev:0, gcost:0, fcost:100000000, posx:x+1, posy:y};
      }
      if(y-1 >= 0 && visited_nodes[x][y-1] == 0){
         visited_nodes[x][y-1] = {visited: this.occupation_grid[x][y-1], prevx:0, prevy:0, has_prev:0, gcost:0, fcost:100000000, posx:x, posy:y-1};
      }
      if(y+1 < size_y && visited_nodes[x][y+1] == 0){
         visited_nodes[x][y+1] = {visited: this.occupation_grid[x][y+1], prevx:0, prevy:0, has_prev:0, gcost:0, fcost:100000000, posx:x, posy:y+1};
      }

      //check the border of the grid and add the neigbours in the list
      if(x-1 >= 0 && visited_nodes[x-1][y].visited == 0){
         lst_ret.push(visited_nodes[x-1][y]);
      }
      if(x+1 < size_x && visited_nodes[x+1][y].visited == 0){
         lst_ret.push(visited_nodes[x+1][y]);
      }
      if(y-1 >= 0 && visited_nodes[x][y-1].visited == 0){
         lst_ret.push(visited_nodes[x][y-1]);
      }
      if(y+1 < size_y && visited_nodes[x][y+1].visited == 0){
         lst_ret.push(visited_nodes[x][y+1]);
      }

      return lst_ret;
   }

   //climbs back the visited node array (using prev) to find the path of the wire
   add_wire(cur, visited_nodes, startx, starty, endx, endy){
      var node = cur;

      this.lines.push({posx:endx, posy:endy, elem:"wire"});

      while(node.posx != startx || node.posy != starty){
         this.lines.push({posx:node.posx, posy:node.posy, elem:"wire"});
         this.occupation_grid[node.posx][node.posy] = 1;
         node = visited_nodes[node.prevx][node.prevy];
      }

      this.lines.push({posx:startx, posy:starty, elem:"wire"});
   }

   draw(){
      if (this.lines.length <= 1){ //needs multiple squares to call that "line"
         return
      }

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = trace_colour

      var cur_pos = {x:this.lines[0].posx, y:this.lines[0].posy};
      var next_pos = {x:this.lines[1].posx, y:this.lines[1].posy};

      //position the "pen" on the first
      ctx.moveTo(cur_pos.x*this.cell_size_x+this.cell_size_x/2, cur_pos.y*this.cell_size_y+this.cell_size_y/2);

      //draw the first stretch of the wire
      if (next_pos.x == cur_pos.x+1) {
         ctx.lineTo(cur_pos.x*this.cell_size_x+this.cell_size_x, cur_pos.y*this.cell_size_y+this.cell_size_y/2);
      }
      if (next_pos.x == cur_pos.x-1) {
         ctx.lineTo(cur_pos.x*this.cell_size_x, cur_pos.y*this.cell_size_y+this.cell_size_y/2);
      }
      if (next_pos.y == cur_pos.y+1) {
         ctx.lineTo(cur_pos.x*this.cell_size_x+this.cell_size_x/2, cur_pos.y*this.cell_size_y+this.cell_size_y);
      }
      if (next_pos.y == cur_pos.y-1) {
         ctx.lineTo(cur_pos.x*this.cell_size_x+this.cell_size_x/2, cur_pos.y*this.cell_size_y);
      }

      //pretty simple algorithm, always draw the wire to the area between the two tiles
      //this gives very good results and is simple, handles well the diagonals
      for (var i = 1; i < this.lines.length-1; i++) {
         var cur_pos = {x:this.lines[i].posx, y:this.lines[i].posy};
         var next_pos = {x:this.lines[i+1].posx, y:this.lines[i+1].posy};

         if (next_pos.x == cur_pos.x+1) {
            ctx.lineTo(cur_pos.x*this.cell_size_x+this.cell_size_x, cur_pos.y*this.cell_size_y+this.cell_size_y/2);
         }
         if (next_pos.x == cur_pos.x-1) {
            ctx.lineTo(cur_pos.x*this.cell_size_x, cur_pos.y*this.cell_size_y+this.cell_size_y/2);
         }
         if (next_pos.y == cur_pos.y+1) {
            ctx.lineTo(cur_pos.x*this.cell_size_x+this.cell_size_x/2, cur_pos.y*this.cell_size_y+this.cell_size_y);
         }
         if (next_pos.y == cur_pos.y-1) {
            ctx.lineTo(cur_pos.x*this.cell_size_x+this.cell_size_x/2, cur_pos.y*this.cell_size_y);
         }
      }

      //finalise drawing
      ctx.stroke();
   }

}

class Grid {
   constructor(canvas_size_x, canvas_size_y, grid_size_x, grid_size_y){
      this.canvas_size_x = canvas_size_x;
      this.canvas_size_y = canvas_size_y;
      this.grid_size_x = grid_size_x;
      this.grid_size_y = grid_size_y;
      this.size_square_x = canvas_size_x/grid_size_x;
      this.size_square_y = canvas_size_y/grid_size_y;

      this.grid = []
      this.occupation_grid = []

      //elements on the board
      this.holes = []
      this.two_pins_elements = []
      this.square_elements = []

      this.end_points = []
      this.connexions = []

      //create the grid of empty nodes (background)
      for(var x = 0; x < grid_size_x; x++){
         this.grid[x] = []
         this.occupation_grid[x] = []
         for (var y = 0; y < grid_size_y; y++) {
            this.grid[x][y] = []
            this.occupation_grid[x][y] = 0
            this.grid[x][y][0] = new Tile(x*this.size_square_x, y*this.size_square_y, this.size_square_x, this.size_square_y)
         }
      }
   }

   //x,y is the coord for the top left of hole
   place_hole(x, y){
      var hole = new Hole(x*this.size_square_x, y*this.size_square_y, 3*this.size_square_x, 3*this.size_square_y, x+1, y+1)

      if(this.occupation_grid[x][y] == 0 && this.occupation_grid[x+1][y] == 0 && this.occupation_grid[x+2][y] == 0 &&
         this.occupation_grid[x][y+1] == 0 && this.occupation_grid[x+1][y+1] == 0 && this.occupation_grid[x+2][y+1] == 0 &&
         this.occupation_grid[x][y+2] == 0 && this.occupation_grid[x+1][y+2] == 0 && this.occupation_grid[x+2][y+2] == 0){

         this.holes.push(hole)

         this.occupation_grid[x][y] = 1
         this.occupation_grid[x+1][y] = 1
         this.occupation_grid[x+2][y] = 1
         this.occupation_grid[x][y+1] = 1
         this.occupation_grid[x+1][y+1] = 1
         this.occupation_grid[x+2][y+1] = 1
         this.occupation_grid[x][y+2] = 1
         this.occupation_grid[x+1][y+2] = 1
         this.occupation_grid[x+2][y+2] = 1

         this.end_points.push(new End_Connexion(x+1, y+1, hole))
         return true;
      }

      return false;
   }

   place_two_pins_element(x, y){

      var is_occupied = false;
      var is_rotated = false;

      if(Math.random() > 0.5){ //randomization of the rotation
         if(x < 4 || x > this.grid_size_x-1-4 || y < 1 || y > this.grid_size_y-1-1){
            return false;
         }

         for (var i = x-3; i <= x+3; i++) {
            for (var j = y-1; j <= y+1; j++) {
               is_occupied = is_occupied || this.occupation_grid[i][j]
            }
         }
      }
      else{
         if(x < 1 || x > this.grid_size_x-1-1 || y < 4 || y > this.grid_size_y-1-4){
            return false;
         }

         for (var i = x-1; i <= x+1; i++) {
            for (var j = y-3; j <= y+3; j++) {
               is_occupied = is_occupied || this.occupation_grid[i][j]
            }
         }
         is_rotated = true
      }

      //add the component on the occupation grid
      if(!is_occupied){
         if(is_rotated){
            for (var i = x-1; i <= x+1; i++) {
               for (var j = y-3; j <= y+3; j++) {
                  this.occupation_grid[i][j] = 1
               }
            }
         }
         else{
            for (var i = x-3; i <= x+3; i++) {
               for (var j = y-1; j <= y+1; j++) {
                  this.occupation_grid[i][j] = 1
               }
            }
         }

         var new_elem = new Two_pins_element(x*this.size_square_x, y*this.size_square_y, this.size_square_x, this.size_square_y, x, y, is_rotated)
         this.two_pins_elements.push(new_elem)
         var pins = new_elem.get_pins()

         this.end_points.push(new End_Connexion(pins.pin1.grid_pos_x, pins.pin1.grid_pos_y, pins.pin1))
         this.end_points.push(new End_Connexion(pins.pin2.grid_pos_x, pins.pin2.grid_pos_y, pins.pin2))

         return true;
      }

      return false;

   }

   place_square_element(x, y, nb_pins){

      var is_occupied = false;

      //too near the borders
      if(x-nb_pins-2 < 0 || x+nb_pins+2 > this.grid_size_x-1 || y-nb_pins-2 < 0 || y+nb_pins+2 > this.grid_size_y-1){
         return false
      }

      //check occupation of the chip
      for (var i = x-nb_pins-1; i <= x+nb_pins+1; i++) {
         for (var j = y-nb_pins-1; j <= y+nb_pins+1; j++) {
            is_occupied = is_occupied || this.occupation_grid[i][j]
         }
      }

      if(is_occupied){
         return false
      }

      //occupy tiles that on which the chip will sit
      for (var i = x-nb_pins-1; i <= x+nb_pins+1; i++) {
         for (var j = y-nb_pins-1; j <= y+nb_pins+1; j++) {
            this.occupation_grid[i][j] = 1
         }
      }

      var new_elem = new Square_element(x*this.size_square_x, y*this.size_square_y, this.size_square_x, this.size_square_y, x, y, nb_pins)
      this.square_elements.push(new_elem)

      var pins = new_elem.get_pins()
      for (var i = 0; i < pins.length; i++) {
         this.end_points.push(new End_Connexion(pins[i].grid_pos_x, pins[i].grid_pos_y, pins[i]))
      }

      return true
   }

   create_connexion(){
      if(this.end_points.length < 2){
         return false;
      }

      for (var i = 0; i < this.end_points.length; i++) {
         var cur_point = this.end_points[i]
         if(cur_point.used == 0){
            var nearest_end_points = [];

            //add other end points the current point will try to connect
            for (var j = 0; j < this.end_points.length; j++) {
               //dont add itself
               if(i!=j && this.end_points[j].used == 0){
                  //not part of the same chip
                  if(this.end_points[i].element.get_parent() != this.end_points[j].element.get_parent()){
                     var dist_to_other_point = Math.sqrt(Math.pow(this.end_points[j].pos_x-cur_point.pos_x, 2)+Math.pow(this.end_points[j].pos_y-cur_point.pos_y, 2))
                     nearest_end_points.push({point:this.end_points[j], dist:dist_to_other_point})
                  }
               }
            }
            //sort from near to far
            nearest_end_points.sort(function(a, b){
               return a.dist - b.dist;
            });
            var found_connexion = false //condition for an early loop abort
            for (var other_point of nearest_end_points) {
               //do not try to connect points that are too far from the current one
               if(i != j && other_point.point.used == 0 && !found_connexion && other_point.dist < 50){
                  var connexion_attempt = new Connexion(this.end_points[i], other_point.point, this.occupation_grid, this.size_square_x, this.size_square_y)

                  //remove occupation of the two end points for the connection attempt
                  this.end_points[i].element.remove_occupation(this.occupation_grid)
                  other_point.point.element.remove_occupation(this.occupation_grid)

                  if (connexion_attempt.find_connexion()){
                     this.end_points[i].used = 1;
                     other_point.point.used = 1;
                     found_connexion = true;
                     this.connexions.push(connexion_attempt)
                  }

                  this.end_points[i].element.add_occupation(this.occupation_grid)
                  other_point.point.element.add_occupation(this.occupation_grid)
               }
            }
         }
      }
   }

   draw(){
      for (var x = 0; x < this.grid.length; x++) {
         for (var y = 0; y < this.grid[x].length; y++) {
            for (var z = 0; z < this.grid[x][y].length; z++) {
               //debug, will draw occupied tile another colour
               // if(this.occupation_grid[x][y] == 1){
               //    this.grid[x][y][z].color = "#ff8000"
               // }
               this.grid[x][y][z].draw()
            }
         }
      }

      //order of thing to draw has an importance to hide some details (ex some wires behind holes)
      for (var i = 0; i < this.connexions.length; i++) {
         this.connexions[i].draw()
      }

      for (var i = 0; i < this.holes.length; i++) {
         this.holes[i].draw()
      }

      for (var i = 0; i < this.two_pins_elements.length; i++) {
         this.two_pins_elements[i].draw()
      }

      for (var i = 0; i < this.square_elements.length; i++) {
         this.square_elements[i].draw()
      }



   }

}

size_canvas = [800, 600];
var last_time_loop = 0

var square_pos = [100,100];
var square_size = 4 //size of tiles

var grid_size = [size_canvas[0]/square_size, size_canvas[1]/square_size]

var grid

grid = new Grid(size_canvas[0], size_canvas[1], grid_size[0], grid_size[1])


//init function for all types of chips
function init_large(){
   for (var i = 0; i < 5;) {
      if(grid.place_square_element( Math.floor(Math.random()*(grid_size[0]-3)+1), Math.floor(Math.random()*(grid_size[1]-3)+1), 7) == true){
         i++;
      }
   }
   for (var i = 0; i < 5;) {
      if(grid.place_square_element( Math.floor(Math.random()*(grid_size[0]-3)+1), Math.floor(Math.random()*(grid_size[1]-3)+1), 5) == true){
         i++;
      }
   }

   grid.create_connexion()
}

function init_medium(){

   for (var i = 0; i < 10;) {
      if(grid.place_square_element( Math.floor(Math.random()*(grid_size[0]-3)+1), Math.floor(Math.random()*(grid_size[1]-3)+1), 3) == true){
         i++;
      }
   }

   grid.create_connexion()
}

function init_small(){

   for (var i = 0; i < 5;) {
      if(grid.place_square_element( Math.floor(Math.random()*(grid_size[0]-3)+1), Math.floor(Math.random()*(grid_size[1]-3)+1), 3) == true){
         i++;
      }
   }

   for (var i = 0; i < 40;) {
      if(grid.place_two_pins_element( Math.floor(Math.random()*(grid_size[0]-3)+1), Math.floor(Math.random()*(grid_size[1]-3)+1)) == true){
         i++;
      }
   }

   for (var i = 0; i < 40;) {
      if(grid.place_hole( Math.floor(Math.random()*(grid_size[0]-3)+1), Math.floor(Math.random()*(grid_size[1]-3)+1)) == true){
         i++;
      }
   }

   grid.create_connexion()
}

var init_sequence = 0;

function main_loop(current_time) {

   //init sequence will place elements one by one on the board and update screen in between
   if(init_sequence < 2){
      init_sequence++;
   }
   else if(init_sequence == 2){
      init_large();
      init_sequence++;
   }
   else if(init_sequence == 3){
      init_medium();
      init_sequence++;
   }
   else if(init_sequence == 4){
      init_small();
      init_sequence++;
   }

   grid.draw()

   //once everything has been place do not draw sceen anymore
   if(init_sequence < 5){
      window.requestAnimationFrame(main_loop)
   }
}

//will be called everytime a click happens, will try to place element on the mouse pos
function event_add_element(event){
   var rect = canvas.getBoundingClientRect()
   var pos_x = event.clientX-rect.left
   var pos_y = event.clientY-rect.top
   var grid_x = Math.floor(pos_x/square_size)
   var grid_y = Math.floor(pos_y/square_size)

   var element_to_place = Math.floor(Math.random()*4);

   //try random element to place, if no success, try a smaller one
   if(element_to_place == 0 && grid.place_square_element(grid_x, grid_y, 5) == false){
      element_to_place = 1;
   }
   if(element_to_place == 1 && grid.place_square_element(grid_x, grid_y, 3) == false){
      element_to_place = 2;
   }
   if(element_to_place == 2 && grid.place_two_pins_element(grid_x, grid_y) == false){
      element_to_place = 3;
   }
   if(element_to_place == 3 && grid.place_hole(grid_x-1, grid_y-1) == false){
      element_to_place = 4;
   }

   //try all connections again
   grid.create_connexion();

   grid.draw()
   window.requestAnimationFrame(main_loop)
}

main_loop()
canvas.addEventListener('click', function(e){event_add_element(e)}, false);
