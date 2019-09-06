const ElementPosition = (node,anchor = 1) => {
  /*
  return the position of anchor point of the node element position in window view
  2nd argument represent the different anchors,show as below:
        1---2--_3
        |   |   |
        4---5---6   <= node element
        |   |   |
        7---8---9
  so ElementPosition(node,5) get the center anchor point coordinate
  */
  try {
    var data = node.getBoundingClientRect();
    var top = data.top,
        left = data.left,
        width = data.width,
        height = data.height;

    return [left + (anchor%3 - 1)*width/2,top + Math.floor((anchor-1)/3)*height/2];
  } catch (e) {
    console.log(e);
    return [0,0];
  }
}

var nav_but ;
if(nav_but = document.getElementById("nav_but")){
  nav_but.addEventListener("click",function () {
    let temp = Number(nav_but.getAttribute("active"));
    temp = (temp+1)%2;
    nav_but.setAttribute("active",temp);
  });
}

var ps ;
if(ps = document.getElementsByClassName('ps-triger')){
  for(let i=0; i<ps.length; i++){
    var target = ps[i].getAttribute('data-target'),
        pos = ElementPosition(ps[i],8);
    ps[i].onmouseenter = function(){
    	document.getElementById(target).style.cssText = `top:${pos[1]}px;left:${pos[0]}px;display:block;opacity:1`;
    }
    ps[i].onmouseleave = function () {
      // document.getElementById(target).style.cssText = "";
    }
  }
}
