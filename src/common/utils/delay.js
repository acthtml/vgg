/**
 * 延迟几秒
 */
export default ms => {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res(true)
    }, ms)
  })
}
