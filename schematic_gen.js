class Chip {
   constructor(px, py, sx, sy){
      this.px = Math.round(px);
      this.py = Math.round(py);
      this.sx = Math.round(sx);
      this.sy = Math.round(sy);
      this.pins = [];

      if(this.py-1 >= 0){
         this.place_pins(this.px, this.py-1, this.px+this.sx, this.py-1, 0, -1, this.sx);
      }
      this.place_pins(this.px+this.sx, this.py, this.px+this.sx, this.py+this.sy, 1, 0, this.sy);
      if(this.px-1 >= 0){
         this.place_pins(this.px-1, this.py, this.px-1, this.py+this.sy, -1, 0, this.sy);
      }
      this.place_pins(this.px, this.py+this.sy, this.px+this.sx, this.py+this.sy, 0, 1, this.sx);

      var i;
      var j;

      for(i = this.px; i < this.px+this.sx; i++){
         for(j = this.py; j < this.py+this.sy; j++){
            occupation[i][j] = 1;
         }
      }

      this.text = "chip"
   }

   set_text(text){
      this.text = text;
   }

   //places pins randomly around chip
   place_pins(start_x, start_y, end_x, end_y, normx, normy, pin_nb){

      var i;

      var increment_x = (start_x == end_x ? 0 : 1);
      var increment_y = (start_y == end_y ? 0 : 1);

      for(i = 0; i < pin_nb; i++){
         if(Math.random() > 0.4){ //prob to have a pin here
            this.pins.push(new Pin(start_x+increment_x*i, start_y+increment_y*i, normx, normy, 0));
            occupation[start_x+increment_x*i][start_y+increment_y*i] = 1;
         }
      }
   }

   draw(){
      var canvas = document.getElementById("myCanvas");
      var ctx = canvas.getContext("2d");
      ctx.strokeStyle = "#000000";
      ctx.rect(this.px*cell_size[0], this.py*cell_size[1], this.sx*cell_size[0], this.sy*cell_size[1]);
      ctx.stroke();


      ctx.font = "12px Arial";
      ctx.fillText(this.text, this.px*cell_size[0]+this.sx*cell_size[0]/8, this.py*cell_size[1]+this.sy*cell_size[1]/2);
   }


}

class Pin{
   constructor(posx, posy, normx, normy, used){
      this.posx = posx;
      this.posy = posy;
      this.normx = normx;
      this.normy = normy;
      this.used = used;
   }

   //draws a little line to represent the pin from the chip
   draw(){
      var canvas = document.getElementById("myCanvas");
      var ctx = canvas.getContext("2d");

      var startx = 0;
      var starty = 0;

      if(this.normx == 1){
         startx = this.posx*cell_size[0];
         starty = this.posy*cell_size[1]+cell_size[1]/2;
      }
      else if(this.normx == -1){
         startx = this.posx*cell_size[0]+cell_size[0];
         starty = this.posy*cell_size[1]+cell_size[1]/2;
      }
      else if(this.normy == 1){
         startx = this.posx*cell_size[0]+cell_size[0]/2;
         starty = this.posy*cell_size[1];
      }
      else if(this.normy == -1){
         startx = this.posx*cell_size[0]+cell_size[0]/2;
         starty = this.posy*cell_size[1]+cell_size[1];
      }

      var centrex = this.posx*cell_size[0]+cell_size[0]/2;
      var centrey = this.posy*cell_size[1]+cell_size[1]/2;

      ctx.beginPath();
      ctx.moveTo(startx, starty);
      ctx.lineTo(centrex, centrey);
      ctx.stroke();
   }
}

class Connexion{
   constructor(pin0, pin1){
      this.pin0 = pin0;
      this.pin1 = pin1;
      this.lines = [];
   }

   find_connexion(){
      //a* algo (or tentative), heuristic is direct distance between node and end

      var visited_nodes = []; //[visited, nextx, nexty, start, end, has_next, cost, posx, posy]
      var list_to_handle = [];
      var startx = 0;
      var starty = 0;
      var endx = this.pin1.posx;
      var endy = this.pin1.posy;

      //build visited nodes matrix
      for(var i = 0; i < occupation.length; i++){
         visited_nodes[i] = occupation[i].slice();
         for(var k = 0; k < visited_nodes[i].length; k++){
            var start = 0;
            var end = 0;

            var fcost = 100000000;//heuristic dist to goal

            var val = {visited: visited_nodes[i][k], prevx:0, prevy:0, has_prev:0, gcost:0, fcost:fcost, posx:i, posy:k}

            if(this.pin0.posx == i && this.pin0.posy == k){
               startx = this.pin0.posx;
               starty = this.pin0.posy;
               list_to_handle.push(val);
            }

            visited_nodes[i][k] = val;
         }
      }


      //max iterations of a*, lower the number is faster but wires will be shorter
      for(var i = 0; i < 300; i++){

         if(list_to_handle.length == 0){
            return false;
         }

         list_to_handle.sort(function(a, b){return a.fcost-b.fcost}); //smallest first

         var cur = list_to_handle[0];

         if(cur.posx == endx && cur.posy == endy){
            //should never happen
            this.add_wire(cur, visited_nodes, startx, starty, endx, endy);
            return true;
         }
         if(cur.posx == endx && cur.posy == endy+1){
            this.add_wire(cur, visited_nodes, startx, starty, endx, endy);
            this.pin1.wirefrom = "S";
            return true;
         }
         if(cur.posx == endx && cur.posy == endy-1){
            this.add_wire(cur, visited_nodes, startx, starty, endx, endy);
            this.pin1.wirefrom = "N";
            return true;
         }
         if(cur.posx == endx+1 && cur.posy == endy){
            this.add_wire(cur, visited_nodes, startx, starty, endx, endy);
            this.pin1.wirefrom = "E";
            return true;
         }
         if(cur.posx == endx-1 && cur.posy == endy){
            this.add_wire(cur, visited_nodes, startx, starty, endx, endy);
            this.pin1.wirefrom = "W";
            return true;
         }

         list_to_handle.shift(); //remove from start

         cur.visited = 1;
         cur.has_prev = 1;

         //define which neighbour is good
         var neigh = this.get_neighbours(cur, visited_nodes);

         for (var u = 0; u < neigh.length; u++) {
            var new_gscore = cur.gcost + 1;
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
            //heuristic = Math.sqrt(Math.pow(endx-neigh[u].posx, 2)+Math.pow(endy-neigh[u].posy, 2));

            //manathan distance heuristic, gives straight lines
            heuristic = Math.abs(endx-neigh[u].posx)+Math.abs(endy-neigh[u].posy);
            neigh[u].fcost = neigh[u].gcost + heuristic; //heuristic
         }

      }

      return false;
   }

   //add wire to the list of wire in this class
   add_wire(cur, visited_nodes, startx, starty, endx, endy){
      var node = cur;

      this.lines.push({posx:endx, posy:endy, elem:"wire"});

      while(node.posx != startx || node.posy != starty){
         this.lines.push({posx:node.posx, posy:node.posy, elem:"wire"});
         occupation[node.posx][node.posy] = 1;
         node = visited_nodes[node.prevx][node.prevy];
      }

      this.lines.push({posx:startx, posy:starty, elem:"wire"});

      this.add_elements();
   }

   //find good places to put resistors and stuff
   add_elements(){
      for (var i = 1; i < this.lines.length-1; i++) {
         var prev = this.lines[i-1];
         var cur = this.lines[i];
         var next = this.lines[i+1];

         if(prev.posx == cur.posx && cur.posx == next.posx && Math.random() > 0.98){
            cur.elem = "vertical_resistor";
         }
         else if(prev.posy == cur.posy && cur.posy == next.posy && Math.random() > 0.98){
            cur.elem = "horizonzal_resistor";
         }
         else if(prev.posx == cur.posx && cur.posx == next.posx && Math.random() > 0.98){
            cur.elem = "vertical_capacitor";
         }
         else if(prev.posy == cur.posy && cur.posy == next.posy && Math.random() > 0.98){
            cur.elem = "horizontal_capacitor";
         }
         else if(prev.posx == cur.posx && cur.posx == next.posx && Math.random() > 0.98){
            if(prev.posy < next.posy){
               cur.elem = "down_diode";
            }
            else{
               cur.elem = "up_diode";
            }
         }
         else if(prev.posy == cur.posy && cur.posy == next.posy && Math.random() > 0.98){
            if(prev.posx < next.posx){
               cur.elem = "right_diode";
            }
            else{
               cur.elem = "left_diode";
            }
         }
      }
   }

   //returns list of neighbours
   get_neighbours(node, visited_nodes){
      var size_x = occupation.length;
      var size_y = occupation[0].length;
      var x = node.posx;
      var y = node.posy;
      var lst_ret = [];

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

   //dirty function, to be cleaned/factorized
   draw(){
      var canvas = document.getElementById("myCanvas");
      var ctx = canvas.getContext("2d");


      var cur = this.lines[0];
      var next = this.lines[1];
      var wire = this.find_second_wire_connect(cur, next);

      ctx.beginPath();
      ctx.moveTo(wire.startx, wire.starty);
      ctx.lineTo(wire.endx, wire.endy);
      ctx.stroke();

      for(var i = 1; i < this.lines.length-1; i++){
         // ctx.beginPath();
         // ctx.rect(this.lines[i].posx*cell_size[0], this.lines[i].posy*cell_size[1], cell_size[0], cell_size[1]);
         // ctx.stroke();

         var prev = this.lines[i-1];
         var cur = this.lines[i];
         var next = this.lines[i+1];
         var wire = this.find_first_wire_connect(prev, cur);

         ctx.beginPath();
         ctx.moveTo(wire.startx, wire.starty);
         ctx.lineTo(wire.endx, wire.endy);
         ctx.stroke();

         wire = this.find_second_wire_connect(cur, next);

         ctx.beginPath();
         ctx.moveTo(wire.startx, wire.starty);
         ctx.lineTo(wire.endx, wire.endy);
         ctx.stroke();

         if(cur.elem == "vertical_resistor"){

            var startx = cur.posx*cell_size[0]+cell_size[0]/4;
            var starty = cur.posy*cell_size[1]+cell_size[1]/8;
            var sizex = cell_size[0]*2/4;
            var sizey = cell_size[1]*6/8;

            ctx.strokeStyle = "#000000";
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(startx, starty, sizex, sizey);
            ctx.strokeRect(startx, starty, sizex, sizey);
            // ctx.stroke();
         }
         if(cur.elem == "horizonzal_resistor"){

            var startx = cur.posx*cell_size[0]+cell_size[0]/8;
            var starty = cur.posy*cell_size[1]+cell_size[1]/4;
            var sizex = cell_size[0]*6/8;
            var sizey = cell_size[1]*2/4;

            ctx.strokeStyle = "#000000";
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(startx, starty, sizex, sizey);
            ctx.strokeRect(startx, starty, sizex, sizey);
            // ctx.stroke();
         }
         if(cur.elem == "vertical_capacitor"){

            var startx = cur.posx*cell_size[0]+cell_size[0]/8;
            var starty = cur.posy*cell_size[1]+cell_size[1]/4;
            var sizex = cell_size[0]*6/8;
            var sizey = cell_size[1]*2/4;

            ctx.strokeStyle = "#000000";
            ctx.fillStyle = "#FFFFFF";
            ctx.strokeRect(startx, starty, sizex, sizey);
            ctx.fillRect(startx-1, starty, sizex+2, sizey);
            // ctx.stroke();
         }
         if(cur.elem == "horizontal_capacitor"){

            var startx = cur.posx*cell_size[0]+cell_size[0]/4;
            var starty = cur.posy*cell_size[1]+cell_size[1]/8;
            var sizex = cell_size[0]*2/4;
            var sizey = cell_size[1]*6/8;

            ctx.strokeStyle = "#000000";
            ctx.fillStyle = "#FFFFFF";
            ctx.strokeRect(startx, starty, sizex, sizey);
            ctx.fillRect(startx, starty-1, sizex, sizey+2);
            // ctx.stroke();
         }
         if(cur.elem == "right_diode"){

            var startx = cur.posx*cell_size[0]+cell_size[0]*1/8;
            var starty = cur.posy*cell_size[1]+cell_size[1]*1/8;
            var sizex = cell_size[0]*5/8;
            var sizey = cell_size[1]*5/8;

            ctx.strokeStyle = "#000000";
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(startx, starty, sizex, sizey);

            ctx.beginPath();
            ctx.moveTo(cur.posx*cell_size[0]+cell_size[0]/8, cur.posy*cell_size[1]+cell_size[1]/8);
            ctx.lineTo(cur.posx*cell_size[0]+cell_size[0]/8, cur.posy*cell_size[1]+cell_size[1]*7/8);
            ctx.lineTo(cur.posx*cell_size[0]+cell_size[0]*6/8, cur.posy*cell_size[1]+cell_size[1]*4/8);
            ctx.lineTo(cur.posx*cell_size[0]+cell_size[0]/8, cur.posy*cell_size[1]+cell_size[1]/8);
            ctx.moveTo(cur.posx*cell_size[0]+cell_size[0]*6/8, cur.posy*cell_size[1]+cell_size[1]*1/8);
            ctx.lineTo(cur.posx*cell_size[0]+cell_size[0]*6/8, cur.posy*cell_size[1]+cell_size[1]*7/8);
            ctx.stroke();
         }
         if(cur.elem == "left_diode"){
            var startx = cur.posx*cell_size[0]+cell_size[0]*2/8;
            var starty = cur.posy*cell_size[1]+cell_size[1]*2/8;
            var sizex = cell_size[0]*5/8;
            var sizey = cell_size[1]*5/8;

            ctx.strokeStyle = "#000000";
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(startx, starty, sizex, sizey);

            ctx.beginPath();
            ctx.moveTo(cur.posx*cell_size[0]+cell_size[0]*7/8, cur.posy*cell_size[1]+cell_size[1]/8);
            ctx.lineTo(cur.posx*cell_size[0]+cell_size[0]*7/8, cur.posy*cell_size[1]+cell_size[1]*7/8);
            ctx.lineTo(cur.posx*cell_size[0]+cell_size[0]*2/8, cur.posy*cell_size[1]+cell_size[1]*4/8);
            ctx.lineTo(cur.posx*cell_size[0]+cell_size[0]*7/8, cur.posy*cell_size[1]+cell_size[1]/8);
            ctx.moveTo(cur.posx*cell_size[0]+cell_size[0]*2/8, cur.posy*cell_size[1]+cell_size[1]*1/8);
            ctx.lineTo(cur.posx*cell_size[0]+cell_size[0]*2/8, cur.posy*cell_size[1]+cell_size[1]*7/8);
            ctx.stroke();
         }
         if(cur.elem == "down_diode" ){
            var startx = cur.posx*cell_size[0]+cell_size[0]/8;
            var starty = cur.posy*cell_size[1]+cell_size[1]/8;
            var sizex = cell_size[0]*5/8;
            var sizey = cell_size[1]*5/8;

            ctx.strokeStyle = "#000000";
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(startx, starty, sizex, sizey);

            ctx.beginPath();
            ctx.moveTo(cur.posx*cell_size[0]+cell_size[0]/8, cur.posy*cell_size[1]+cell_size[1]/8);
            ctx.lineTo(cur.posx*cell_size[0]+cell_size[0]*7/8, cur.posy*cell_size[1]+cell_size[1]/8);
            ctx.lineTo(cur.posx*cell_size[0]+cell_size[0]*4/8, cur.posy*cell_size[1]+cell_size[1]*6/8);
            ctx.lineTo(cur.posx*cell_size[0]+cell_size[0]/8, cur.posy*cell_size[1]+cell_size[1]/8);
            ctx.moveTo(cur.posx*cell_size[0]+cell_size[0]*1/8, cur.posy*cell_size[1]+cell_size[1]*6/8);
            ctx.lineTo(cur.posx*cell_size[0]+cell_size[0]*7/8, cur.posy*cell_size[1]+cell_size[1]*6/8);
            ctx.stroke();
         }
         if(cur.elem == "up_diode"){
            var startx = cur.posx*cell_size[0]+cell_size[0]*2/8;
            var starty = cur.posy*cell_size[1]+cell_size[1]*2/8;
            var sizex = cell_size[0]*5/8;
            var sizey = cell_size[1]*5/8;

            ctx.strokeStyle = "#000000";
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(startx, starty, sizex, sizey);

            ctx.beginPath();
            ctx.moveTo(cur.posx*cell_size[0]+cell_size[0]/8, cur.posy*cell_size[1]+cell_size[1]*7/8);
            ctx.lineTo(cur.posx*cell_size[0]+cell_size[0]*7/8, cur.posy*cell_size[1]+cell_size[1]*7/8);
            ctx.lineTo(cur.posx*cell_size[0]+cell_size[0]*4/8, cur.posy*cell_size[1]+cell_size[1]*2/8);
            ctx.lineTo(cur.posx*cell_size[0]+cell_size[0]/8, cur.posy*cell_size[1]+cell_size[1]*7/8);
            ctx.moveTo(cur.posx*cell_size[0]+cell_size[0]*1/8, cur.posy*cell_size[1]+cell_size[1]*2/8);
            ctx.lineTo(cur.posx*cell_size[0]+cell_size[0]*7/8, cur.posy*cell_size[1]+cell_size[1]*2/8);
            ctx.stroke();
         }

      }

      var prev = this.lines[this.lines.length-2];
      var cur = this.lines[this.lines.length-1];
      var wire = this.find_first_wire_connect(prev, cur);

      ctx.beginPath();
      ctx.moveTo(wire.startx, wire.starty);
      ctx.lineTo(wire.endx, wire.endy);
      ctx.stroke();
   }

   //for a tile, find correct orientation to draw the wire
   //ex: if previous wire tile is under current one, the current wire
   //should start from the bottom
   find_first_wire_connect(prev, cur){
      var startx = 0;
      var starty = 0;
      if(prev.posx+1 == cur.posx){
         startx = cur.posx*cell_size[0];
         starty = cur.posy*cell_size[1]+cell_size[1]/2;
      }
      if(prev.posx-1 == cur.posx){
         startx = cur.posx*cell_size[0]+cell_size[0];
         starty = cur.posy*cell_size[1]+cell_size[1]/2;
      }
      if(prev.posy+1 == cur.posy){
         startx = cur.posx*cell_size[0]+cell_size[0]/2;
         starty = cur.posy*cell_size[1];
      }
      if(prev.posy-1 == cur.posy){
         startx = cur.posx*cell_size[0]+cell_size[0]/2;
         starty = cur.posy*cell_size[1]+cell_size[1];
      }

      var endx = cur.posx*cell_size[0]+cell_size[0]/2;
      var endy = cur.posy*cell_size[1]+cell_size[1]/2;

      return {startx:startx, starty:starty, endx:endx, endy:endy};
   }

   find_second_wire_connect(cur, next){
      var startx;
      var starty;
      if(cur.posx+1 == next.posx){
         startx = cur.posx*cell_size[0]+cell_size[0];
         starty = cur.posy*cell_size[1]+cell_size[1]/2;
      }
      if(cur.posx-1 == next.posx){
         startx = cur.posx*cell_size[0];
         starty = cur.posy*cell_size[1]+cell_size[1]/2;
      }
      if(cur.posy+1 == next.posy){
         startx = cur.posx*cell_size[0]+cell_size[0]/2;
         starty = cur.posy*cell_size[1]+cell_size[1];
      }
      if(cur.posy-1 == next.posy){
         startx = cur.posx*cell_size[0]+cell_size[0]/2;
         starty = cur.posy*cell_size[1];
      }

      var endx = cur.posx*cell_size[0]+cell_size[0]/2;
      var endy = cur.posy*cell_size[1]+cell_size[1]/2;

      return {startx:startx, starty:starty, endx:endx, endy:endy};
   }
}


//correspond to a gnd or a pin in out
class End_Element{
   constructor(posx, posy, type){
      this.posx = posx;
      this.posy = posy;
      this.type = type;
      this.used = 0;
      this.wirefrom = "S";
   }

   draw(){
      var canvas = document.getElementById("myCanvas");
      var ctx = canvas.getContext("2d");
      if(this.type == "GND"){
         ctx.strokeStyle = "#000000";
         ctx.fillStyle = "#FFFFFF";

         if(this.wirefrom == "N"){
            ctx.moveTo(this.posx*cell_size[0]+cell_size[0]*1/8, this.posy*cell_size[1]+cell_size[1]*4/8);
            ctx.lineTo(this.posx*cell_size[0]+cell_size[0]*7/8, this.posy*cell_size[1]+cell_size[1]*4/8);
            ctx.stroke();
            ctx.moveTo(this.posx*cell_size[0]+cell_size[0]*2/8, this.posy*cell_size[1]+cell_size[1]*6/8);
            ctx.lineTo(this.posx*cell_size[0]+cell_size[0]*6/8, this.posy*cell_size[1]+cell_size[1]*6/8);
            ctx.stroke();
            ctx.moveTo(this.posx*cell_size[0]+cell_size[0]*3/8, this.posy*cell_size[1]+cell_size[1]*8/8);
            ctx.lineTo(this.posx*cell_size[0]+cell_size[0]*5/8, this.posy*cell_size[1]+cell_size[1]*8/8);
            ctx.stroke();
         }
         else{ //draw a pin in out
            ctx.fillRect(this.posx*cell_size[0], this.posy*cell_size[1], cell_size[0], cell_size[1]);
            ctx.beginPath();
            ctx.arc(this.posx*cell_size[0]+cell_size[0]/2, this.posy*cell_size[1]+cell_size[1]/2, cell_size[0]/2, 0, 2 * Math.PI);
            ctx.stroke();

            // ctx.strokeRect(this.posx*cell_size[0], this.posy*cell_size[1], cell_size[0], cell_size[1]);
         }
      }
   }
}

class Transistor{
   constructor(posx, posy){
      this.posx = posx;
      this.posy = posy;
      this.orientation = "W";
      this.pins = [];

      var rand = Math.random();
      if(rand >= 0 && rand <= 0.25)
         this.orientation = "N";
      if(rand >= 0.25 && rand <= 0.5)
         this.orientation = "W";
      if(rand >= 0.5 && rand <= 0.75)
         this.orientation = "S";
      if(rand >= 0.75 && rand <= 1.0)
         this.orientation = "E";

      if(this.orientation == "N"){
         this.place_pin(posx+1, posy-1, 0, -1);
         this.place_pin(posx-1, posy+2, -1, 0);
         this.place_pin(posx+3, posy+2, 1, 0);
      }
      else if(this.orientation == "W"){
         this.place_pin(posx+2, posy-1, 0, -1);
         this.place_pin(posx+2, posy+3, 0, 1);
         this.place_pin(posx-1, posy+1, -1, 0);
      }
      else if(this.orientation == "S"){
         this.place_pin(posx+1, posy+3, 0, 1);
         this.place_pin(posx-1, posy+0, -1, 0);
         this.place_pin(posx+3, posy+0, 1, 0);
      }
      else if(this.orientation == "E"){
         this.place_pin(posx+0, posy-1, 0, -1);
         this.place_pin(posx+0, posy+3, 0, 1);
         this.place_pin(posx+3, posy+1, 1, 0);
      }

   }

   place_pin(posx, posy, normx, normy){
      this.pins.push(new Pin(posx, posy, normx, normy, 0));
      occupation[posx][posy] = 1;
   }

   draw(){
      var canvas = document.getElementById("myCanvas");
      var ctx = canvas.getContext("2d");
      ctx.strokeStyle = "#000000";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(this.posx*cell_size[0], this.posy*cell_size[1], cell_size[0]*3, cell_size[1]*3);
      for (var i = 0; i < this.pins.length; i++) {
         this.pins[i].draw();
      }
      var rot = 0;
      if(this.orientation == "W"){
         rot = 0;
      }
      else if(this.orientation == "N"){
         rot = 3.1415/2;
      }
      else if(this.orientation == "E"){
         rot = 3.1415;
      }
      else if(this.orientation == "S"){
         rot = 3*3.1415/2;
      }
      this.draw_picture([Math.cos(rot),-Math.sin(rot),Math.sin(rot),Math.cos(rot)]);

   }

   //dirty function, values were calculated on a sheet of paper and hard coded here
   draw_picture(rot_mat){
      var canvas = document.getElementById("myCanvas");
      var ctx = canvas.getContext("2d");
      ctx.beginPath();
      ctx.arc(this.posx*cell_size[0]+cell_size[0]*3/2, this.posy*cell_size[1]+cell_size[1]*3/2, cell_size[0]*3/2, 0, 2 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      var gposx = this.posx*cell_size[0];
      var gposy = this.posy*cell_size[1];
      var midx = cell_size[0]*3/2;
      var midy = cell_size[1]*3/2;
      //extentions of out pins
      ctx.moveTo( gposx+midx+(cell_size[0]*2/2)*rot_mat[0]+(-cell_size[1]*3/2)*rot_mat[1], gposy+midy+(cell_size[0]*2/2)*rot_mat[2]+(-cell_size[1]*3/2)*rot_mat[3] );
      ctx.lineTo( gposx+midx+(cell_size[0]*2/2)*rot_mat[0]+(-cell_size[1]*2/2)*rot_mat[1], gposy+midy+(cell_size[0]*2/2)*rot_mat[2]+(-cell_size[1]*2/2)*rot_mat[3] );
      ctx.moveTo( gposx+midx+(cell_size[0]*2/2)*rot_mat[0]+(cell_size[1]*3/2)*rot_mat[1], gposy+midy+(cell_size[0]*2/2)*rot_mat[2]+(cell_size[1]*3/2)*rot_mat[3] );
      ctx.lineTo( gposx+midx+(cell_size[0]*2/2)*rot_mat[0]+(cell_size[1]*2/2)*rot_mat[1], gposy+midy+(cell_size[0]*2/2)*rot_mat[2]+(cell_size[1]*2/2)*rot_mat[3] );
      ctx.moveTo( gposx+midx+(-cell_size[0]*3/2)*rot_mat[0]+(cell_size[1]*0/2)*rot_mat[1], gposy+midy+(-cell_size[0]*3/2)*rot_mat[2]+(cell_size[1]*0/2)*rot_mat[3] );
      ctx.lineTo( gposx+midx+(-cell_size[0]*1/2)*rot_mat[0]+(cell_size[1]*0/2)*rot_mat[1], gposy+midy+(-cell_size[0]*1/2)*rot_mat[2]+(cell_size[1]*0/2)*rot_mat[3] );
      //middle bar
      ctx.moveTo( gposx+midx+(-cell_size[0]*1/2)*rot_mat[0]+(-cell_size[1]*2/2)*rot_mat[1], gposy+midy+(-cell_size[0]*1/2)*rot_mat[2]+(-cell_size[1]*2/2)*rot_mat[3] );
      ctx.lineTo( gposx+midx+(-cell_size[0]*1/2)*rot_mat[0]+(cell_size[1]*2/2)*rot_mat[1], gposy+midy+(-cell_size[0]*1/2)*rot_mat[2]+(cell_size[1]*2/2)*rot_mat[3] );
      //two diagonals
      ctx.moveTo( gposx+midx+(cell_size[0]*2/2)*rot_mat[0]+(-cell_size[1]*2/2)*rot_mat[1], gposy+midy+(cell_size[0]*2/2)*rot_mat[2]+(-cell_size[1]*2/2)*rot_mat[3] );
      ctx.lineTo( gposx+midx+(-cell_size[0]*1/2)*rot_mat[0]+(-cell_size[1]*1/2)*rot_mat[1], gposy+midy+(-cell_size[0]*1/2)*rot_mat[2]+(-cell_size[1]*1/2)*rot_mat[3] );
      ctx.moveTo( gposx+midx+(cell_size[0]*2/2)*rot_mat[0]+(cell_size[1]*2/2)*rot_mat[1], gposy+midy+(cell_size[0]*2/2)*rot_mat[2]+(cell_size[1]*2/2)*rot_mat[3] );
      ctx.lineTo( gposx+midx+(-cell_size[0]*1/2)*rot_mat[0]+(cell_size[1]*1/2)*rot_mat[1], gposy+midy+(-cell_size[0]*1/2)*rot_mat[2]+(cell_size[1]*1/2)*rot_mat[3] );
      ctx.stroke();
   }
}

class OpAmp{
   constructor(posx, posy){
      this.posx = posx;
      this.posy = posy;
      this.orientation = "W";
      this.pins = [];

      var rand = Math.random();
      if(rand >= 0 && rand <= 0.25)
         this.orientation = "N";
      if(rand >= 0.25 && rand <= 0.5)
         this.orientation = "W";
      if(rand >= 0.5 && rand <= 0.75)
         this.orientation = "S";
      if(rand >= 0.75 && rand <= 1.0)
         this.orientation = "E";

      if(this.orientation == "N"){
         this.place_pin(posx+1, posy-1, 0, -1);
         // this.place_pin(posx-1, posy+1, -1, 0);
         // this.place_pin(posx+3, posy+1, 1, 0);
         this.place_pin(posx+0, posy+3, 0, 1);
         this.place_pin(posx+2, posy+3, 0, 1);
      }
      else if(this.orientation == "W"){
        this.place_pin(posx-1, posy+1, -1, 0);
        // this.place_pin(posx-1, posy+1, -1, 0);
        // this.place_pin(posx+3, posy+1, 1, 0);
        this.place_pin(posx+3, posy+0, 1, 0);
        this.place_pin(posx+3, posy+2, 1, 0);
      }
      else if(this.orientation == "S"){
        this.place_pin(posx+1, posy+3, 0, 1);
        // this.place_pin(posx-1, posy+1, -1, 0);
        // this.place_pin(posx+3, posy+1, 1, 0);
        this.place_pin(posx+0, posy-1, 0, -1);
        this.place_pin(posx+2, posy-1, 0, -1);
      }
      else if(this.orientation == "E"){
        this.place_pin(posx+3, posy+1, 1, 0);
        // this.place_pin(posx-1, posy+1, -1, 0);
        // this.place_pin(posx+3, posy+1, 1, 0);
        this.place_pin(posx-1, posy+0, -1, 0);
        this.place_pin(posx-1, posy+2, -1, 0);
      }

   }

   place_pin(posx, posy, normx, normy){
      this.pins.push(new Pin(posx, posy, normx, normy, 0));
      occupation[posx][posy] = 1;
   }

   draw(){
      var canvas = document.getElementById("myCanvas");
      var ctx = canvas.getContext("2d");
      ctx.strokeStyle = "#000000";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(this.posx*cell_size[0], this.posy*cell_size[1], cell_size[0]*3, cell_size[1]*3);
      for (var i = 0; i < this.pins.length; i++) {
         this.pins[i].draw();
      }
      var rot = 0;
      if(this.orientation == "W"){
         rot = 0;
      }
      else if(this.orientation == "N"){
         rot = 3.1415/2;
      }
      else if(this.orientation == "E"){
         rot = 3.1415;
      }
      else if(this.orientation == "S"){
         rot = 3*3.1415/2;
      }
      this.draw_picture([Math.cos(rot),-Math.sin(rot),Math.sin(rot),Math.cos(rot)]);

   }

   //dirty function, values were calculated on a sheet of paper and hard coded here
   draw_picture(rot_mat){
      var canvas = document.getElementById("myCanvas");
        var ctx = canvas.getContext("2d");
      // ctx.beginPath();
      // ctx.arc(this.posx*cell_size[0]+cell_size[0]*3/2, this.posy*cell_size[1]+cell_size[1]*3/2, cell_size[0]*3/2, 0, 2 * Math.PI);
      // ctx.stroke();
      ctx.beginPath();
      var gposx = this.posx*cell_size[0];
      var gposy = this.posy*cell_size[1];
      var midx = cell_size[0]*3/2;
      var midy = cell_size[1]*3/2;
      //triangle
      ctx.moveTo( gposx+midx+(cell_size[0]*3/2)*rot_mat[0]+(-cell_size[1]*3/2)*rot_mat[1], gposy+midy+(cell_size[0]*3/2)*rot_mat[2]+(-cell_size[1]*3/2)*rot_mat[3] );
      ctx.lineTo( gposx+midx+(-cell_size[0]*3/2)*rot_mat[0]+(cell_size[1]*0/2)*rot_mat[1], gposy+midy+(-cell_size[0]*3/2)*rot_mat[2]+(cell_size[1]*0/2)*rot_mat[3] );
      ctx.lineTo( gposx+midx+(cell_size[0]*3/2)*rot_mat[0]+(cell_size[1]*3/2)*rot_mat[1], gposy+midy+(cell_size[0]*3/2)*rot_mat[2]+(cell_size[1]*3/2)*rot_mat[3] );
      ctx.lineTo( gposx+midx+(cell_size[0]*3/2)*rot_mat[0]+(-cell_size[1]*3/2)*rot_mat[1], gposy+midy+(cell_size[0]*3/2)*rot_mat[2]+(-cell_size[1]*3/2)*rot_mat[3] );

      //+ sign
      ctx.moveTo( gposx+midx+(cell_size[0]*2/2)*rot_mat[0]+(-cell_size[1]*2/2)*rot_mat[1], gposy+midy+(cell_size[0]*2/2)*rot_mat[2]+(-cell_size[1]*2/2)*rot_mat[3] );
      ctx.lineTo( gposx+midx+(cell_size[0]*2/2)*rot_mat[0]+(-cell_size[1]*1/2)*rot_mat[1], gposy+midy+(cell_size[0]*2/2)*rot_mat[2]+(-cell_size[1]*1/2)*rot_mat[3] );
      ctx.moveTo( gposx+midx+(cell_size[0]*3/4)*rot_mat[0]+(-cell_size[1]*3/4)*rot_mat[1], gposy+midy+(cell_size[0]*3/4)*rot_mat[2]+(-cell_size[1]*3/4)*rot_mat[3] );
      ctx.lineTo( gposx+midx+(cell_size[0]*5/4)*rot_mat[0]+(-cell_size[1]*3/4)*rot_mat[1], gposy+midy+(cell_size[0]*5/4)*rot_mat[2]+(-cell_size[1]*3/4)*rot_mat[3] );

      //- sign
      ctx.moveTo( gposx+midx+(cell_size[0]*2/2)*rot_mat[0]+(cell_size[1]*1/2)*rot_mat[1], gposy+midy+(cell_size[0]*2/2)*rot_mat[2]+(cell_size[1]*1/2)*rot_mat[3] );
      ctx.lineTo( gposx+midx+(cell_size[0]*2/2)*rot_mat[0]+(cell_size[1]*2/2)*rot_mat[1], gposy+midy+(cell_size[0]*2/2)*rot_mat[2]+(cell_size[1]*2/2)*rot_mat[3] );

      ctx.stroke();
   }
}

size_canvas = [1600, 900];
cell_size = [14, 14];
grid_size = [size_canvas[0]/cell_size[0], size_canvas[1]/cell_size[1]];

lst_chip = [];
lst_connexion = [];
nb_chips_side_x = 3;
nb_chips_side_y = 3;
nb_chips = nb_chips_side_x*nb_chips_side_y;

lst_end_elem = [];
nb_end_elem = 30;

lst_transistors = [];
nb_transistors = 7;

lst_opamp = [];
nb_opamp = 7;

occupation = [];

for(x = 0; x < grid_size[0]+10; x++){
   array = [];
   for(y = 0; y < grid_size[1]+10; y++){
      array.push(0);
   }
   occupation.push(array);
}

var counter = 0
for(x = 0; x < nb_chips_side_x; x++){
   for(y = 0; y < nb_chips_side_y; y++){
      rand = Math.random();
      var chip = new Chip(Math.random()*20+40*x, Math.random()*7+20*y, 9+Math.random()*10, 5+Math.random()*7)
      chip.set_text("chip"+counter);
      counter++;
      lst_chip.push(chip);
   }
}

for(i = 0; i < nb_chips; i++){
   lst_chip[i].draw();
   for(j = 0; j < lst_chip[i].pins.length; j++){
      lst_chip[i].pins[j].draw();
   }
}

for (var i = 0; i < nb_transistors; i++) {
   var rand_x = Math.round(Math.random()*grid_size[0]);
   var rand_y = Math.round(Math.random()*grid_size[1]);

   var is_free = true;
   for (var x = rand_x; x < rand_x+3; x++) {
      for (var y = rand_y; y < rand_y+3; y++) {
         //find if this is a good place, otherwise delete it
         if(occupation[x][y] == 1)
            is_free = false;
         if(x-1 < 0 || occupation[x-1][y] == 1)
            is_free = false;
         if(x+1 >= grid_size[0] || occupation[x+1][y] == 1)
            is_free = false;
         if(y-1 < 0 || occupation[x][y-1] == 1)
            is_free = false;
         if(y+1 >= grid_size[1] || occupation[x][y+1] == 1)
            is_free = false;
      }
   }

   if(is_free){
      lst_transistors.push(new Transistor(rand_x, rand_y));
      for (var x = rand_x; x < rand_x+3; x++) {
         for (var y = rand_y; y < rand_y+3; y++) {
            occupation[x][y] = 1;
         }
      }
   }
}

for (var i = 0; i < nb_opamp; i++) {
   var rand_x = Math.round(Math.random()*grid_size[0]);
   var rand_y = Math.round(Math.random()*grid_size[1]);

   var is_free = true;
   for (var x = rand_x; x < rand_x+3; x++) {
      for (var y = rand_y; y < rand_y+3; y++) {
         //find if this is a good place, otherwise delete it
         if(occupation[x][y] == 1)
            is_free = false;
         if(x-1 < 0 || occupation[x-1][y] == 1)
            is_free = false;
         if(x+1 >= grid_size[0] || occupation[x+1][y] == 1)
            is_free = false;
         if(y-1 < 0 || occupation[x][y-1] == 1)
            is_free = false;
         if(y+1 >= grid_size[1] || occupation[x][y+1] == 1)
            is_free = false;
      }
   }

   if(is_free){
      lst_opamp.push(new OpAmp(rand_x, rand_y));
      for (var x = rand_x; x < rand_x+3; x++) {
         for (var y = rand_y; y < rand_y+3; y++) {
            occupation[x][y] = 1;
         }
      }
   }
}

//place end elements (gnd, vcc, i/o)
for (var i = 0; i < nb_end_elem; i++) {
   var rand_x = Math.round(Math.random()*grid_size[0]);
   var rand_y = Math.round(Math.random()*grid_size[1]);

   //find if this is a good place, otherwise delete it
   if(occupation[rand_x][rand_y] == 1)
      continue;
   if(rand_x-1 < 0 || occupation[rand_x-1][rand_y] == 1)
      continue;
   if(rand_x+1 >= grid_size[0] || occupation[rand_x+1][rand_y] == 1)
      continue;
   if(rand_y-1 < 0 || occupation[rand_x][rand_y-1] == 1)
      continue;
   if(rand_y+1 >= grid_size[1] || occupation[rand_x][rand_y+1] == 1)
      continue;

   lst_end_elem.push(new End_Element(rand_x, rand_y, "GND"));
   occupation[rand_x][rand_y] = 1;
}
nb_end_elem = lst_end_elem.length;

var lst_pins = [];
for (var i = 0; i < lst_transistors.length; i++) {
   lst_pins.push(lst_transistors[i].pins[0]);
   lst_pins.push(lst_transistors[i].pins[1]);
   lst_pins.push(lst_transistors[i].pins[2]);
}

for (var i = 0; i < lst_opamp.length; i++) {
   lst_pins.push(lst_opamp[i].pins[0]);
   lst_pins.push(lst_opamp[i].pins[1]);
   lst_pins.push(lst_opamp[i].pins[2]);
}

for (var i = 0; i < nb_end_elem; i++) {
   lst_pins.push(lst_end_elem[i]);
}

//place wires to opamp, transistors and end elem
for (var i = 0; i < lst_pins.length; i++) {

   var lst_chip_dst = [];
   //find closest chip
   for (var l = 0; l < nb_chips; l++) {
      var centrex = lst_chip[l].px + lst_chip[l].sx/2;
      var centrey = lst_chip[l].py + lst_chip[l].sy/2;
      var elemx = lst_pins[i].posx;
      var elemy = lst_pins[i].posy;
      var dist = Math.sqrt(Math.pow(centrex-elemx, 2)+Math.pow(centrey-elemy, 2));
      lst_chip_dst.push({dist:dist, chip:lst_chip[l]});
   }
   lst_chip_dst.sort(function(a, b){return a.dist-b.dist}); //smallest first

   for (var l = 0; l < 4; l++) { //only take nearest chips
      var endelem = lst_pins[i];
      var pins1 = lst_chip_dst[l].chip.pins;

      var lst_pin_dist = [];
      for(j = 0; j < pins1.length; j++){
         var dist = Math.sqrt(Math.pow(pins1[j].posx-endelem.posx, 2)+Math.pow(pins1[j].posy-endelem.posy, 2));
         lst_pin_dist.push({dist:dist, pin:pins1[j]});
      }
      lst_pin_dist.sort(function(a, b){return a.dist-b.dist}); //smallest first

      for(j = 0; j < pins1.length; j++){
         var pin1 = lst_pin_dist[j].pin;
         if(endelem.used == 0 && pin1.used == 0 && Math.random() > 0.0){
            connexion = new Connexion(pin1, endelem);
            if(connexion.find_connexion()){
               lst_connexion.push(connexion);
               endelem.used = 1;
               pin1.used = 1;
            }
         }
      }
   }
}

//link the chips
for(i = 0; i < nb_chips; i++){

   for (var l = 1; l < nb_chips; l++) {
      var pins0 = lst_chip[i].pins;
      var pins1 = lst_chip[(i+l)%nb_chips].pins;
      var nb_pins = Math.min(pins0.length, pins1.length);
      var pins_zip = [];

      for(j = 0; j < nb_pins; j++){
         for(k = 0; k < nb_pins; k++){
            var weight = Math.sqrt(Math.pow(pins0[j].posx-pins1[k].posx, 2)+Math.pow(pins0[j].posy-pins1[k].posy, 2));
            pins_zip.push({weight:weight, pin0:pins0[j], pin1:pins1[k]});
         }
      }
      pins_zip.sort(function(a, b){return a.weight-b.weight}); //smallest first

      for(j = 0; j < nb_pins; j++){
         var pin0 = pins_zip[j].pin0;
         var pin1 = pins_zip[j].pin1;
         if(pin0.used == 0 && pin1.used == 0 && Math.random() > 0.0){
            connexion = new Connexion(pin0, pin1);
            if(connexion.find_connexion()){
               lst_connexion.push(connexion);
               pin0.used = 1;
               pin1.used = 1;
            }
         }
      }
   }
}

var new_list = [];
for (var i = 0; i < nb_end_elem; i++) {
   if(lst_end_elem[i].used == 1){
      new_list.push(lst_end_elem[i]);
   }
}
lst_end_elem = new_list;
nb_end_elem = lst_end_elem.length;


for (var i = 0; i < lst_connexion.length; i++) {
   lst_connexion[i].draw();
}

for (var i = 0; i < nb_end_elem; i++) {
   lst_end_elem[i].draw();
}

for (var i = 0; i < lst_transistors.length; i++) {
   lst_transistors[i].draw();
}

for (var i = 0; i < lst_opamp.length; i++) {
   lst_opamp[i].draw();
}

//draw occupation
for(x = 0; x < grid_size[0]; x++){
   for(y = 0; y < grid_size[1]; y++){
      if(occupation[x][y] == 1){
         var canvas = document.getElementById("myCanvas");
         var ctx = canvas.getContext("2d");
         ctx.beginPath();
         ctx.rect(x*cell_size[0], y*cell_size[1], cell_size[0], cell_size[1]);
         ctx.fillStyle = "red";
         //uncomment to see occupation
         //ctx.fill();
      }
   }
}
