export const genericService = () => {
	return `export interface IGenericService<E> {
	getAll(): Promise<E[]>;
	save(entity: E): Promise<E>;
	update(entity: E): Promise<E>;
	deleteById(id: number): Promise<boolean>;
}`;
};
