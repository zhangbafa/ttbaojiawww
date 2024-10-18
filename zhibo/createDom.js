const scrollData = [];
const userID = []
const containerWidth = window.innerWidth;
const container = document.querySelector(".overlay-text");

// 添加 DOM 元素
function addItemToDom(item) {
  const div = document.createElement("div");
  div.className = "item";
  div.style.left = Math.random() * (containerWidth - 70) + "px"; // 随机水平位置
  div.style.animationDuration = `${item.scope * 2000}ms`; // 根据scope设置动画速度

  div.setAttribute("data-id", item.id);

  const avatar = document.createElement("img");
  
  if (item.diamondCount == 1) {
    avatar.className = "avatar";
  } 
  if (item.diamondCount > 1) {
    avatar.className = "avatar1";
  }
  avatar.src = item.avatar;

  const nickname = document.createElement("div");
  nickname.textContent = item.nickname;
  if (item.diamondCount == 1) {
    nickname.className = "nickname";
  } 
  if (item.diamondCount > 1) {
    nickname.className = "nickname1";
  }

  const gift = document.createElement("img");
  gift.src = item.giftUri;
  div.appendChild(gift);
  div.appendChild(avatar);
  div.appendChild(nickname);
  document.body.appendChild(div);

  observeElement(div, item.id); // 观察新元素是否移出页面
}

// 创建 IntersectionObserver 实例
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting === false) {
      // 元素已经离开视口，删除它
      const id = entry.target.getAttribute("data-id");
      removeItem(id);
      document.body.removeChild(entry.target);
      // console.log(`当前共有元素：${scrollData.length}`);
      // console.log(document.querySelectorAll(".item").length);
    }
  });
});

// 开始观察元素
function observeElement(element, id) {
  observer.observe(element);
}

// 移动元素
function moveItems() {
  data.forEach((item) => {
    const element = document.querySelector(`[data-id='${item.id}']`);
    if (element) {
      const bottom = parseFloat(element.style.bottom) || 0;
      const newBottom = bottom + 1 / item.scope; // 根据 scope 调整移动速度
      element.style.bottom = newBottom + "px";
    }
  });
  requestAnimationFrame(moveItems);
}

// 从数据数组中删除元素
function removeItem(id) {
  const index = scrollData.findIndex((item) => item.id == id);
  if (index !== -1) {
    scrollData.splice(index, 1);
  }
}

// 添加数据并启动移动动画
function addDataAndMove(newItem) {
  scrollData.push(newItem);
  addItemToDom(newItem);
  if(scrollData.length>=20){
    console.log(`Dom个数: ${scrollData.length}`)
  }
}

