import { Box, Button, Flex, Link, Spinner } from "@chakra-ui/react"
import { Form, Formik } from "formik"
import InputField from "../components/InputField"
import Wrapper from "../components/Wrapper"
import { ForgotPasswordInput, useForgotPasswordMutation } from "../generated/graphql"
import { useCheckAuth } from "../utils/useCheckAuth"
import NextLink from 'next/link'

const ForgotPassword = () => {
	const {data: authData, loading: authLoading} = useCheckAuth()

  const initialValues = {email: ''}

  const [forgotPassword, {loading, data}] = useForgotPasswordMutation();

  const onForgotPasswordSubmit = async (values: ForgotPasswordInput) => {
    await forgotPassword({variables: { forgotPasswordInput: values }});
  }

  return (
		<>
			{authLoading || (!authLoading && authData?.me) ? (
				<Flex justifyContent='center' alignItems='center' minHeight='100vh'>
					<Spinner />
				</Flex>
			): (
					<Wrapper size='small'>
						<Formik initialValues={initialValues} onSubmit={onForgotPasswordSubmit}>
							{({ isSubmitting }) => !loading && data ? <Box>Please check your inbox</Box> :  (
								<Form>
									<Box mt={4}>
										<InputField
											name='email'
											placeholder='Email'
											label='Email'
											type='email'
										/>
									</Box>

									<Flex mt={2}>
										<NextLink href='/login'>
											<Link ml='auto'>Back to login</Link>
										</NextLink>
									</Flex>

									<Button
										type='submit'
										colorScheme='teal'
										mt={4}
										isLoading={isSubmitting}>
										Send Reset Password Email
									</Button>
								</Form>
							)}
						</Formik>
					</Wrapper>
				)
			}
		</>
  )
}

export default ForgotPassword
