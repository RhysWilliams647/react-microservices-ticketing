import axios from "axios";

export default ({ req }) => {
  if (typeof window === "undefined") {
    //  We are o the server
    //  Note namespace is part of kubernetes and ingress-nginx exists
    //  in its own namespace
    // "http://SERVICENAME.NAMESPACE.svc.cluster.local"
    //  Due to using minikube ingress-nginx is under namespace kube-system
    //  run commands
    //  kubectl get pods -n kube-system
    //  kubectl describe pod ingress-nginx-controller-789d9c4dc-f8tq6 -n kube-system
    //  to get ip address
    //  "http://ingress-nginx.ingress-nginx.svc.cluster.local"  //  If not minikube would be using this
    return axios.create({
      //baseURL: "http://192.168.99.109",
      baseURL: "http://www.rwtickets-app-prod.xyz/",
      headers: req.headers,
    });
  } else {
    //  We are on the browser
    return axios.create({
      baseURL: "/",
    });
  }
};
