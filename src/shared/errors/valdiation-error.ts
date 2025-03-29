export class ValidationError extends Error {
  constructor(
    public field: string,
    public message: string,
  ) {
    super(message)
    this.name = 'ValidationError'
  }
}
