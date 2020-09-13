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
    //  kubectl describe pod ingress-nginx-controller-7bb4c67d67-tbzbx -n kube-system
    //  to get ip address
    //  "http://ingress-nginx.ingress-nginx.svc.cluster.local/api/users/currentuser"
    return axios.create({
      baseURL: "http://192.168.99.101",
      headers: req.headers,
    });
  } else {
    //  We are on the browser
    return axios.create({
      baseURL: "/",
    });
  }
};
