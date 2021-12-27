import { Context } from '../types/Context';
import { Ctx, Query, Resolver } from "type-graphql";
import { BaseEntity } from "typeorm";

@Resolver()
export class HelloResolver extends BaseEntity {
  @Query(_return => String)
  hello(
    @Ctx() {req}: Context
  ){
    console.log(req.session.userId);
    return `hello world ${req.session.userId}`;
  }
}