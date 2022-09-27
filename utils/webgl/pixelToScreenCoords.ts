const pixelToScreenCoords = (x: number, y: number) => ({
  x: (x - window.innerWidth / 2) / (window.innerWidth / 2), //-1, 1,
  y: -((y - window.innerHeight / 2) / (window.innerHeight / 2)), //-1, 1
})

export default pixelToScreenCoords
