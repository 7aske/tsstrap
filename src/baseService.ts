export const baseService = () => `
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { backendUrl } from "./config";

export default class BaseService {
	private readonly _baseUrl: string;
	private readonly _client: AxiosInstance;

	constructor(baseUrl: string, config?: AxiosRequestConfig) {
		const instance = axios.create(config);
		instance.interceptors.request.use(BaseService.authorizationOnFulfilled, BaseService.authorizationOnRejected);
		instance.interceptors.response.use(BaseService.loggingOnFulfilled, BaseService.loggingOnRejected);
		this._client = instance;
		this._baseUrl = backendUrl + baseUrl;
	}

	private static isDev = () => process.env.NODE_ENV === "development";

	public get(url: string, config?: AxiosRequestConfig): Promise<any> {
		return this._client.get(this._baseUrl + url, config);
	}

	public head(url: string, config?: AxiosRequestConfig): Promise<any> {
		return this._client.head(this._baseUrl + url, config);
	}

	public delete(url: string, config?: AxiosRequestConfig): Promise<any> {
		return this._client.delete(this._baseUrl + url, config);
	}

	public options(url: string, config?: AxiosRequestConfig): Promise<any> {
		return this._client.options(this._baseUrl + url, config);
	}

	public post(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
		return this._client.post(this._baseUrl + url, data, config);
	}

	public put(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
		return this._client.put(this._baseUrl + url, data, config);
	}

	public patch(url: string, data?: any, config?: AxiosRequestConfig): Promise<any> {
		return this._client.patch(this._baseUrl + url, data, config);
	}

	private static loggingOnFulfilled(res: AxiosResponse) {
		if (BaseService.isDev()) console.log(res);
		return res;
	}

	private static loggingOnRejected(error: any) {
		if (BaseService.isDev()) console.error(error);
		return Promise.reject(error);
	}

	private static authorizationOnFulfilled(config: AxiosRequestConfig) {
		config.headers["Authorization"] = \`Bearer \${Cookies.get("auth")}\`;
		return config;
	}

	private static authorizationOnRejected(error: any) {
		return Promise.reject(error);
	}
}
`
