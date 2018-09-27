export default (namespace) => {
  return () => {
    console.log(namespace, 'pass');
    return namespace;
  }
}
